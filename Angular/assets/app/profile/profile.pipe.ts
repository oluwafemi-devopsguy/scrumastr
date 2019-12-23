import { Pipe, PipeTransform, SecurityContext } from '@angular/core';
import { DataService } from '../data.service';
import { DomSanitizer, SafeHtml, SafeStyle, SafeScript, SafeUrl, SafeResourceUrl  } from '@angular/platform-browser';




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
		if (!this.dataservice.users_done.find(x => x.user_id === goals.user && x.work_id === goals.push_id)) {
			var user_obj = {user_id:goals.user, work_id:goals.push_id, goal_array:new Array()}
			this.dataservice.users_done.push(user_obj)
			console.log("********************* USER Passed for WordID*************************")
			console.log(this.dataservice.users_done)	
			console.log(user_obj)		
		}
		console.log("IN THE INDEX OF ARRAY WorkID********************************************S")	
		var user_index = this.dataservice.users_done.findIndex(y => y.user_id === goals.user && y.work_id === goals.push_id)
		console.log(user_index)
		this.dataservice.users_done[user_index].goal_array.push(goals)
		console.log(this.dataservice.users_done)	
		return		
	}
}



@Pipe({name: 'user_TFT'})
export class TFTsGoalsPipe implements  PipeTransform {

 constructor(
      public dataservice: DataService
      ) { }

 public work_IDs:any = [];


 transform(goals, userr?: number){
 	console.log(" for inside user_TFT pipe^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^^")
 	// if (!this.dataservice.users_TFT.find(x => x.user_id === goals.user)) {
		// 	var user_obj = {user_id:goals.user, done_goal_array:new Array()}
		// 	this.dataservice.users_TFT.push(user_obj)
		// 	console.log("********************* USER Passed for UserTFT$$$$$*************************")
		// 	console.log(this.dataservice.users_TFT)	
		// 	console.log(user_obj)		
		// }
	console.log("IN THE INDEX OF ARRAYyy UserTFT?^^^^********************************************S")	
	var user_index = this.dataservice.users_TFT.findIndex(y => y.user_id === goals.user)

	console.log(!this.dataservice.users_TFT[user_index].done_goal_array.find(x => x === goals))
	console.log(this.dataservice.users_TFT.findIndex(y => y.user_id === goals.user))
	console.log(this.dataservice.users_TFT[user_index].done_goal_array)

	if (!this.dataservice.users_TFT[user_index].done_goal_array.find(x => x === goals))	{
		console.log(user_index)
		this.dataservice.users_TFT[user_index].done_goal_array.push(goals)
		console.log(this.dataservice.users_TFT)	
		return	
	} 

	
	}
}



@Pipe({name: 'init_user_lane'})
export class InitUserLanePipe implements  PipeTransform {

 constructor(
      public dataservice: DataService
      ) { }


 transform(user){
 	if (!this.dataservice.users_TFT.find(x => x.user_id === user.id)) {
			var user_obj = {user_id:user.id, done_goal_array:new Array()}
			this.dataservice.users_TFT.push(user_obj)
			console.log("$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$$This isn user init")
			console.log(this.dataservice.users_TFT)	
			console.log(user_obj)		
		}



		}

}





@Pipe({name: 'elementize'})
export class ElementizePipe implements  PipeTransform {

 constructor(
      private sanitizer: DomSanitizer, private _domSanitizer: DomSanitizer, public dataservice: DataService
      ) { }


  transform(value: any): SafeHtml   {
  	let output = this.stylize(value)
  	console.log(typeof output)
  	console.log(output)
  	console.log(typeof `<strong>hello world</strong>`)
    return this._domSanitizer.bypassSecurityTrustHtml(output);
    // return this.sanitizer.sanitize(SecurityContext.HTML, output);
    // return this.sanitizer.sanitize(SecurityContext.HTML, (this.stylize(value)))
    // return value;
  }


   // Modify this method according to your custom logic
  private stylize(text: any):  any  {
    let stylizedText: string = '';
    if (text && text.length > 0) {
      for (let t of text.split(" ")) {
        if (t.startsWith("#") && t.length>1)
          stylizedText +=  `<span style="font-weight: bold; color: #1f7a7a">${t}</span> `;
        else
          stylizedText += t + " ";
      }
      console.log("This is stylized======================")
      console.log(typeof stylizedText)
      return stylizedText;
    }
    console.log("This is stylized====================== no length")
    return text;
  }

 // transform(message){
 // 	console.log("This is elementize")
 // 	console.log(message)

 // 	return message

	// 	}

}