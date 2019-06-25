import { Pipe, PipeTransform } from '@angular/core';
import { DataService } from '../data.service';



@Pipe({name: 'workids'})
export class WorkIDsPipe implements  PipeTransform {
 public message;
 public work_Id_Array:any = [];
 public goal_array:any = [];
 // public workID_goal_array:any = [];


 constructor(
      public dataservice: DataService
      ) { }

	transform(goals)   {
		console.log('INSIDE PIPE 1--GOALS, 3- user_id ARRAY, 5- USER INDEX TO P[USH GOAL, 7-NEW USER ID')
		console.log(goals)
		if (!this.dataservice.users_id.find(x => x.user_id === goals.user && x.work_id === goals.push_id)) {
			var user_obj = {user_id:goals.user, work_id:goals.push_id, goal_array:new Array()}
			this.dataservice.users_id.push(user_obj)
			console.log("********************* UYSER Passed for push*************************")
			console.log(this.dataservice.users_id)			
		}
		console.log("IN THE INDEX OF ARRAY********************************************S")	
		var user_index = this.dataservice.users_id.findIndex(y => y.user_id === goals.user && y.work_id === goals.push_id)
		console.log(user_index)
		this.dataservice.users_id[user_index].goal_array.push(goals)
		console.log(this.dataservice.users_id)	
		return		
	}
}



@Pipe({name: 'WorkIDsGoals'})
export class WorkIDsGoalsPipe implements  PipeTransform {
 public message;
 // public workID_goal_array:any = [];
 public work_Id_Array:any = [];



 constructor(
      public dataservice: DataService
      ) { }

 public work_IDs:any = [];


	transform(goals) {
		console.log("*******************THIS IS SECOND TRANS*****************************")
		console.log(this.dataservice.workID_goal_array)
		console.log(this.dataservice.users)
		for (var i = 0; i < this.dataservice.workID_goal_array.length; i++) {
			console.log(this.dataservice.workID_goal_array[i])
			if (this.work_Id_Array.length == 0) {
				console.log(this.work_Id_Array.length)
				
				console.log("this.dataservice.work_IDs is emptyfff444")
				
				console.log(this.work_Id_Array)

				var goal_obj = {
					
					goal_data:goals, goal_array:new Array()};
				// this.goal_array.push(goal_obj)
				this.work_Id_Array.push()

			}

		}

		// for (var i = 0; i < this.dataservice.work_IDs.length; i++) {

		// 	for (var j = 0; j < this.dataservice.workID_goal_array.length; j++) {
		// 		console.log(this.dataservice.work_IDs )
		// 		this.dataservice.work_IDs[i] = new Array()
		// 		console.log(this.dataservice.work_IDs)
		// 		console.log("111THIS IS INSIDE second pipe PIOPE")
		// 		console.log(this.dataservice.workID_goal_array[j].push_id)
		// 		console.log(this.dataservice.work_IDs )
		// 		console.log("=======================PRESENTLY HERTE=============================")
		// 		console.log(this.dataservice.workID_goal_array[j].push_id)
		// 		console.log(this.dataservice.work_IDs[i])
		// 		if (this.dataservice.workID_goal_array[j].push_id == this.dataservice.work_IDs[i]) {

		// 			console.log(this.dataservice.work_IDs[i])
		// 			this.dataservice.work_IDs[i].push(this.dataservice.workID_goal_array[j])
		// 			console.log(this.dataservice.work_IDs[i])
		// 		}
		// 	}
		// }
		
		// var goal_array = Array()
		// var wordID_array = Array()
		// this.message= "Messfafafaf"
		// goal_array.push(goals)
		// var goal_obj = {name:goals.push_id, goal_data:goals};
		// this.dataservice.work_IDs.push({goal_obj:goal_obj})
		// this.dataservice.workID_goal_array.push(goals)
		// console.log(this.dataservice.workID_goal_array)
		console.log("THIS IS INSIDE second pipe PIOPE")
		console.log(this.dataservice.work_IDs)
		// console.log(goal_array)
		console.log(this.dataservice.workID_goal_array)
		var to_return = "Just test return"
		return to_return
		

	}

}
