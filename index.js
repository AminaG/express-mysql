var _=require('underscore')
var mysql=require('mysql')

module.exports=function(settings){
	var conn=require('mysql').createConnection(settings)
	var app=require('express')()
	
	app.get('/frontend/settings.json',function(req,res){
		res.send(settings.frontend)
	})
	app.use('/frontend',require('express').static(__dirname +'/frontend'))
	
	app.get('/rows',function(req,res){
		if(!req.query.table && !req.query.query){
			return res.send('You must specify table')
		}
		var sql='';

		if (req.query.query) {
			sql+='select * from(' + req.query.query + ') query'
		}
		else if(req.query.table){
			// What do select
			sql='select * '

			// FROM
			sql+='from '
			sql+=settings.database+ '.'+require('mysql').escapeId(req.query.table) 
		}

			// WHERE
			if(req.query.filter){
				sql+=' where '
				var where=JSON.parse(req.query.filter)
				for(var i in where){
					sql+= mysql.escapeId(i) + ' like "%' + mysql.escape(where[i]).slice(1,-1) + '%" and '
				}
				sql+=' true'
			}

		// ORDER
		if(req.query.order){
			sql+=' order by '
			var order=JSON.parse(req.query.order)
			for(var i in order){
				sql+=require('mysql').escapeId(i) + ' ' + order[i].match(/asc|desc/) + ','
			}
			sql+='true'
		}	


		// LIMIT
		var maxLimit	
		if(req.query.limit && (req.query.limit<100 || req.query.filename ))
			maxLimit=parseInt(req.query.limit)
		if(!maxLimit && !req.query.filename) maxLimit=100
		if(maxLimit)
		sql+=' limit ' + parseInt(maxLimit)

		console.log(sql)
		if(sql.match(/update|delete|alter|modify/i)) return res.send('query not suppurted')
		if(!sql.match(/select/i)) return res.send('query not suppurted')

			
		res.set('content-type','application/json')
		if(req.query.filename){
			res.set('Content-Disposition','attachment; filename=' + req.query.filename)
		}
		if(req.query.format!='csv') res.write('[')
		if(req.query.omit && !_.isArray(req.query.omit)) req.query.omit=[req.query.omit]
		var firstLine=true
		conn
				.query(sql)
				.stream()
				.pipe(require('stream').Transform({
					objectMode:true,
					transform:function(object,encoding,callback){
							var ans=''
							if(req.query.omit){
								for(var i in req.query.omit){
									delete object[req.query.omit[i]]
								}
							}
							//Only In First Line
							if(firstLine){
								if(req.query.format=='csv'){
										ans+=jsonLine2csv(_.keys(object)) + '\r\n'								
								}
							}
							//Only Not In First Line
							if(!firstLine){
								if(req.query.format!='csv'){
									ans+=','
								}
							}
							firstLine=false
							// In all the lines
							if(req.query.format=='csv')
								ans+=jsonLine2csv(object) + '\r\n'
							else
								ans+=require('json-prune')(object)

							callback(null,ans)
					},
					error:function(){
					}
				}))
				.on('error',function(err){
					console.log('there')
						console.log(err)
				})
				.on('finish',function(){
					if(req.query.format!='csv')  res.write(']')
					res.end()
				})
				.pipe(res)
	})
	app.get('/tables',function(req,res){
			conn
			.query('select TABLE_NAME,UPDATE_TIME,table_schema from information_schema.tables where lcase(table_schema)=lcase(?)',[settings.database],function(err,rows){
				res.send(rows)
			})
			// res.send('great!')
	})
	
	return function(){
		app.apply(null,arguments)
	}
	
}


function jsonLine2csv(data){
	var str=''
	for(var i in data){
		str+='"' + String(data[i]).replace(/"/g,'""') +'",'
	}
	str=str.slice(0,-1)
	return str
}
function jsonArray2csv(data){
	var str=''
	if(data.length>0){
		str=jsonLine2csv(_.keys(data[0])) + '\r\n'
	}
	for(var i=1;i<data.length;i++){
		str+=jsonLine2csv(data[i]) + '\r\n'
	}
	str=str.slice(0,-2)
	return str
}