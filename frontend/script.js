var app=angular.module(['app'],['ui.router'])

app.config(function($stateProvider,$urlRouterProvider){
	$urlRouterProvider.otherwise("/");
	$stateProvider
			.state({
				name:'home',
				url:'/',
				templateUrl:'choose-a-table.html'
			})
			.state({
				name:'show-a-table',
				url:'/show-a-table?table&omit&order&filter&query',
				templateUrl	:'show-a-table.html'
			})
})
app.run(function($http,$rootScope,$state){
	$rootScope.rootScope=rootScope=$rootScope
	$rootScope.$state=state=$state

	$rootScope.rootScope.beforeChooseTable=true
	$rootScope.$on('clickChooseTable',function(event,table){
		// $rootScope.rootScope.beforeChooseTable=false
		// $rootScope.rootScope.currentTable=table.TABLE_NAME
		$state.go('show-a-table',{table:table.TABLE_NAME})
	})
	$rootScope.downloadTable=function(){		
		location.href=getUrl() + '&format=csv&filename=danny.csv'
	}

	//Load Settings
	$http.get('settings.json').then(function(ans){$rootScope.settings=ans.data})
})

function getUrl(){
	return '../rows?table=' + rootScope.currentTable
}