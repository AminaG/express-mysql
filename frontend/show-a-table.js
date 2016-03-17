app.controller('show-a-table-list',function($scope,$state,$http,$rootScope,$stateParams,$timeout){
	$scope.omit=angular.isArray($stateParams.omit) ? $stateParams.omit : [$stateParams.omit]
	$scope.order=($stateParams.order && JSON.parse($stateParams.order)) || {}
	$scope.filter=($stateParams.filter && JSON.parse($stateParams.filter)) || {}
	$timeout(function(){
		$http
			.get('../rows/'+ location.href.match(/\?.+/)[0])
			.then(function(ans){
				if(ans.data){
					$scope.rows=ans.data
				}
			})
			.catch(function(ans){
				console.log('catch',ans)
				alert(ans)
			})	
	},0)
	$scope.downloadTable=function(){
		location.href='../rows/'+ location.href.match(/\?.+/)[0] + '&filename=moshe.csv&format=csv'
	}
	$scope.omitKey=function(key){
			var omit=$stateParams.omit || []
			if(!angular.isArray(omit)) omit=[omit]
			omit.push(key)
			$stateParams.omit=omit
			$state.go('show-a-table',$stateParams)
	}
	$scope.removeOmitKey=function(key){
			delete $scope.omit[key]
			$stateParams.omit=$scope.omit
			$state.go('show-a-table',$stateParams)
	}
	$scope.orderAsc=function(key){
			$scope.order[key]='asc'
			$stateParams.order=JSON.stringify($scope.order)
			$state.go('show-a-table',$stateParams)
	}
	$scope.orderDesc=function(key){
			$scope.order[key]='desc'
			$stateParams.order=JSON.stringify($scope.order)
			$state.go('show-a-table',$stateParams)
	}
	$scope.removeOrder=function(key){
			delete $scope.order[key]
			$stateParams.order=JSON.stringify($scope.order)
			$state.go('show-a-table',$stateParams)
	}
	$scope.clickFilterOnField=function(key){
		bootbox.prompt('Enter query:',function(ans){
			delete $scope.filter[key]
			if(ans){
				$scope.filter[key]=ans
			}
			$stateParams.filter=JSON.stringify($scope.filter)
			$state.go('show-a-table',$stateParams)
		})
	}
})