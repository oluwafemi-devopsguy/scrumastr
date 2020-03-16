import { Component, OnInit, ElementRef, ViewChildren, QueryList, ViewChild } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import {Title} from "@angular/platform-browser";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { DataService } from '../data.service';
import { THIS_EXPR } from '@angular/compiler/src/output/output_ast';


@Component({
  selector: 'app-scrumboard',
  templateUrl: './scrumboard.component.html',
  styleUrls: ['./scrumboard.component.css']
})
export class ScrumboardComponent implements OnInit {
  @ViewChildren('details') details: QueryList<any>;

  constructor(
    private http: HttpClient, 
    private router: Router, 
    private dataService: DataService, 
    private pageTitle: Title,
    private route: ActivatedRoute,
    ) { }

  ngOnInit() {
    this.load()
    this.rose()
    this.close()
    this.pageTitle.setTitle('Scrumboard')
    this.getAllUsersGoals()
    this.getAllSprints()
  }

  // ngAfterViewInit(): void {
    
  // }

  public imgName = "No image selected";
  public alert;
  public TFTW = [];
  public TFTD = [];
  public verify = [];
  public done = [];
  public users = [];
  public participants = [];
  public project_id = sessionStorage.getItem('project_id');
  loggedUser = sessionStorage.getItem('realname')
  loggedUserRole = sessionStorage.getItem('role');
  public loggedUserId;
  public sprints = [];
  public currentSprint = [];
  public loggedSprint = { sprintID: " ", dateCreated: "2020-03-03T16:33:59.817708Z", endDate: "2020-03-03T16:33:59.817708Z"};
  public loggedProject;
  public colors = ['255, 76, 109', '89, 187, 30', '221, 164, 72', '141, 106, 159', '187, 52, 47', '131, 116, 91', '16, 52, 166', '133, 47, 100','38, 166, 154']
  public taskToEdit;
  public goal_name;

  load(){
    if (window.localStorage) {
      if (!localStorage.getItem('firstLoad')) {
        localStorage['firstLoad'] = true;
        window.location.reload();
      }
      else
        localStorage.removeItem('firstLoad');
    }
    window.onload = function() {
      $(".preloader").slideUp(1300);
      let imgBorder1 = document.getElementsByClassName('themeImg').item(0) as HTMLElement;
      let imgBorder2 = document.getElementsByClassName('themeImg').item(1) as HTMLElement;
      let imgBorder3 = document.getElementsByClassName('themeImg').item(2) as HTMLElement;
      let imgBorder4 = document.getElementsByClassName('themeImg').item(3) as HTMLElement;
      let imgBorder5 = document.getElementsByClassName('themeImg').item(4) as HTMLElement;
      let imgBorder6 = document.getElementsByClassName('themeImg').item(5) as HTMLElement;

      let imgBtm1 = document.getElementsByClassName('imgBtm').item(0) as HTMLElement;
      let imgBtm2 = document.getElementsByClassName('imgBtm').item(1) as HTMLElement;
      let imgBtm3 = document.getElementsByClassName('imgBtm').item(2) as HTMLElement;
      let imgBtm4 = document.getElementsByClassName('imgBtm').item(3) as HTMLElement;
      let imgBtm5 = document.getElementsByClassName('imgBtm').item(4) as HTMLElement;
      let imgBtm6 = document.getElementsByClassName('imgBtm').item(5) as HTMLElement;

      let currentTheme = document.getElementById('currentTheme');
      if (localStorage.getItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q') == 'Z556fbesgMPvm2U') {
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211899/Rectangle_4_whcw4u.png)";
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Automobile";
        currentTheme.style.marginLeft = "-22px";
        imgBorder2.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm2.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      } else if (localStorage.getItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q') == 'CArCK4Vm5hyRF5B') {
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211925/Rectangle_5_kflvow.png)";
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Dark Cloud";
        currentTheme.style.marginLeft = "-22px";
        imgBorder3.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm3.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      } else if (localStorage.getItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q') == '32J94BFgeC9zTNf') {
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211929/Rectangle_6_bmdatg.png)";
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Landmark";
        currentTheme.style.marginLeft = "-30px";
        imgBorder4.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm4.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      } else if (localStorage.getItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q') == 'ShFzC9vBEcFz8Rk') {
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211924/Rectangle_7_dff7kq.png)";
        document.getElementsByClassName('currentTheme')[0].innerHTML = "City View";
        currentTheme.style.marginLeft = "-30px";
        imgBorder5.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm5.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      } else if (localStorage.getItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q') == 'XB8svCwGLr359na') {
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211913/Rectangle_8_rieqnp.png)";
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Blue Sky";
        currentTheme.style.marginLeft = "-36px";
        imgBorder6.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm6.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      } else {
        document.getElementById("splitLeft").style.background = "white";
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Plain";
        currentTheme.style.marginLeft = "-55px";
        imgBorder1.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm1.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      }
    };
  
  }

  NotificationBox(alert) {
    let x = document.getElementById("alert");
    document.getElementById('alert').innerHTML = alert;
    x.className = "show";
    setTimeout(function () {
      x.className = x.className.replace("show", "");
    }, 3000);
  }

  
  close(){
    let hides = document.getElementById("splitLeft") as HTMLElement;
    let moda = document.getElementById("addTaskModal") as HTMLElement;
    let moda1 = document.getElementById("addNoteModal") as HTMLElement;
    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;
    let logoutModal = document.getElementById("logoutModal") as HTMLElement;
    let appInfoModal = document.getElementById("appInfoModal") as HTMLElement;
    let userProfileModal = document.getElementById("userProfileModal") as HTMLElement;
    let viewUploadedImageModal = document.getElementById("uploadedImageModal") as HTMLElement;
    moda.style.display = "none";
    moda1.style.display = "none";
    hides.style.overflowY = "scroll";
    openEditTaskModal.style.display = "none";
    uploadImageModal.style.display = "none";
    taskHistoryModal.style.display = "none";
    logoutModal.style.display = "none";
    appInfoModal.style.display = "none";
    userProfileModal.style.display = "none";
    viewUploadedImageModal.style.display = "none";

    
  }

  editTaskModal(edit) {
    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;
    openEditTaskModal.style.display = "block";
    this.taskToEdit = edit.getAttribute('task_to_edit');
    this.dataService.taskIdToEdit = 'g'+edit.getAttribute('task_id_to_edit');
  }

  uploadImage(edit) {
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    uploadImageModal.style.display = "block";
    this.dataService.taskIdToEdit = 'G' + edit.getAttribute('task_id_to_upload_img')
  }

  taskHistory () {
    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;
    taskHistoryModal.style.display = "block";
  }

  userProfileModal() {
    let userProfileModal = document.getElementById("userProfileModal") as HTMLElement;
    userProfileModal.style.display = "block"
  }

  userImageModal (imageToView) {
    let imageModal = document.getElementById('imageToView') as HTMLImageElement;
    let viewUploadedImageModal = document.getElementById("uploadedImageModal") as HTMLElement;
    viewUploadedImageModal.style.display = "block";
    imageModal.src = imageToView.src;
  }

  appInfo () {
    let appInfoModal = document.getElementById("appInfoModal") as HTMLElement;
    appInfoModal.style.display = "block"
  }

  logoutModal() {
    let logoutModal = document.getElementById("logoutModal") as HTMLElement;
    logoutModal.style.display = "block"
  }

  addTaskModal(whichmodal) {
    let modal = document.getElementById("addTaskModal") as HTMLElement;
    let modal1 = document.getElementById("addNoteModal") as HTMLElement; 
    if (whichmodal == 'task') {
      modal.style.display = 'block';
    } if (whichmodal == 'note') {
      modal1.style.display = 'block';
    }
  }

  rose(){
    let modal = document.getElementById("addTaskModal") as HTMLElement;
    let btnmod = document.getElementById("addTaskBtn") as HTMLElement;

    let modal1 = document.getElementById("addNoteModal") as HTMLElement;
    let btnmod1 = document.getElementById("addNoteBtn") as HTMLElement;

    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;

    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;

    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;

    let userProfileModal = document.getElementById("userProfileModal") as HTMLElement;
    let viewUploadedImageModal = document.getElementById("uploadedImageModal") as HTMLElement;
    let logoutModal = document.getElementById("logoutModal") as HTMLElement;
    let appInfoModal = document.getElementById("appInfoModal") as HTMLElement;

    let hides = document.getElementById("splitLeft") as HTMLElement;
    let createSprint = document.getElementById('createSprint') as HTMLElement;

    // let ttAddTask = document.getElementById("ttAddTaskBtn") as HTMLElement;
    // let ttAddNote = document.getElementById("ttAddNoteBtn") as HTMLElement;

    function hideDropDown(element, classToRemove, classToAdd) {
      element.classList.remove(classToRemove)
      element.classList.add(classToAdd)
    }

    btnmod.onclick = function () {
      modal.style.display = "block";
    }

    if (this.loggedUserRole != "Owner" && this.loggedUserRole != "Admin") {
      createSprint.style.display = 'none';
    }

    // ttAddTask.onclick = function () {
    //   modal.style.display = "block";
    // }

    btnmod1.onclick = function () {
      modal1.style.display = "block";
    }

    // ttAddNote.onclick = function () {
    //   modal1.style.display = "block";
    // }

    


    window.onclick = function (e) {

      let projectDD = document.getElementById('projectsDDContent') as HTMLElement;
      let themeDD = document.getElementById('themeDDContent') as HTMLElement;
      let sprintDD = document.getElementById('sprintDDContent') as HTMLElement;
      let target = e.target as HTMLElement
      if (e.target == modal) {
        modal.style.display = 'none';
      }

      if (e.target == modal1) {
        modal1.style.display = 'none';
        hides.style.overflowY = "scroll";
      }

      if(e.target == openEditTaskModal) {
        openEditTaskModal.style.display = "none";
      }

      if (e.target == uploadImageModal) {
        uploadImageModal.style.display = "none";
      }

      if (e.target == taskHistoryModal) {
        taskHistoryModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (e.target == userProfileModal) {
        userProfileModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (e.target == viewUploadedImageModal) {
        viewUploadedImageModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (e.target == appInfoModal) {
        appInfoModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (e.target == logoutModal) {
        logoutModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (
        target.matches('a#themeTab') || 
        target.matches('span#currentTheme') ||
        target.matches('a#themeTab.nav-link.otherNavTools h4')
        ) {
        hideDropDown(themeDD, undefined, 'ppDD')
      } else if (target.matches('img.themeImg')) {
        hideDropDown(themeDD, undefined, 'ppDD')
      } else if (
        target.matches('a#sprintTab') ||
        target.matches('span.loggedSprint') ||
        target.matches('a#sprintTab.nav-link.otherNavTools h4')
        ) {
        hideDropDown(sprintDD, undefined, 'spDD')
      } else if (
        target.matches('#sprintDDContent.sprintDropDownContent.spDD') || 
        target.matches('#sprintDDContent.sprintDropDownContent.spDD p') ||
        target.matches('#sprintDDContent.sprintDropDownContent.spDD p label') ||
        target.matches('#sprintDDContent.sprintDropDownContent.spDD p label.activ') ||
        target.matches('#sprintDDContent.sprintDropDownContent.spDD p span.spanAct') ||
        target.matches('#sprintDDContent.sprintDropDownContent.spDD p span') ||
        target.matches('#sprintDDContent.sprintDropDownContent.spDD #createSprint.sprintDropDownCS')

        ) {
        hideDropDown(sprintDD, undefined, 'spDD')
      } else if (
        target.matches('a#projectsTab') ||
        target.matches('span.loggedProject') ||
        target.matches('a#projectsTab.nav-link.otherNavTools h4')
        ) {
        hideDropDown(projectDD, undefined, 'ppDD')
      } else {
        document.getElementById('projectsDDContent').classList.add('animateDD');
        document.getElementById('sprintDDContent').classList.add('animateDD');
        document.getElementById('themeDDContent').classList.add('animateDD');
        setTimeout("document.getElementById('sprintDDContent').classList.remove('spDD')", 1000);
        setTimeout("document.getElementById('themeDDContent').classList.remove('ppDD')", 1000);
        setTimeout("document.getElementById('projectsDDContent').classList.remove('animateDD')", 1000);
        setTimeout("document.getElementById('sprintDDContent').classList.remove('animateDD')", 1000);
        setTimeout("document.getElementById('themeDDContent').classList.remove('animateDD')", 1000);
        setTimeout("document.getElementById('projectsDDContent').classList.remove('ppDD')", 1000);

      }

    }

  }

  borderRadious(user) {
    let detail = user.getAttribute('data-target');
    document.getElementById(detail).classList.toggle('teamTaskDropDownMenuToggle');
    let toggledUp = document.getElementById(`toggledUp${detail}`).classList;
    if (toggledUp.contains('fa-chevron-up')) {
      toggledUp.replace('fa-chevron-up', 'fa-chevron-down')
    } else if (toggledUp.contains('fa-chevron-down')) {
      toggledUp.replace('fa-chevron-down', 'fa-chevron-up')
    }
  }

  hideslackchat() {
    let hideS = document.getElementById("splitRight") as HTMLElement;
    let hides = document.getElementById("splitLeft") as HTMLElement;
    hideS.style.zIndex = "0";
    hides.style.overflowY = "hidden";
  }

  imageName() {
    let name = document.getElementById('imgUpload') as HTMLInputElement;
    let progressBar = document.getElementById("progressBar");
    let width = 1;
    let progressId = setInterval(time, 10);
    this.imgName = name.files.item(0).name;
    function time() {
      if (width >= 100) {
        clearInterval(progressId);
      } else {
        width++;
        progressBar.style.width = width + '%';
      }
    }
    let imgFile = document.querySelector('input[type=file]') as HTMLInputElement;
    this.dataService.image_uploaded = imgFile.files[0]

  }

  copyToClipboard(taskToCopy) {
    //let range = document.createRange();
    let textToCopy = taskToCopy.getAttribute('task_to_edit').createTextRange();
    //window.getSelection().removeAllRanges();
    //window.getSelection().addRange(range);
    //document.execCommand("copy");
    //window.getSelection().removeAllRanges();
    window.getSelection().addRange(textToCopy)
    textToCopy.setSelectionRange(0, 99999)
    document.execCommand("copy");
    this.NotificationBox("Copied to clipboard!")
  }


  hideAddTaskandNoteBTN() {
    document.getElementById('addTaskBtn').style.display = 'none';
    document.getElementById('addNoteBtn').style.display = 'none';

  }

  showAddTaskandNoteBTN() {
    document.getElementById('addTaskBtn').style.display = 'block';
    document.getElementById('addNoteBtn').style.display = 'block';

  }

  showProjectTabContents() {
    let projectDropDown = document.getElementById("projectsDDContent") as HTMLElement;
    projectDropDown.classList.add("ppDD");
  }

  selectThemeTabContents() {
    let themeDropDown = document.getElementById("themeDDContent") as HTMLElement;
    themeDropDown.classList.add("ppDD");
  }

  showSprintTabContents() {
    let sprintDropDown = document.getElementById("sprintDDContent") as HTMLElement;
    sprintDropDown.classList.add("spDD");
  }

  useDefaultTheme(theme) {
    let imgBorder1 = document.getElementsByClassName('themeImg').item(0) as HTMLElement;
    let imgBorder2 = document.getElementsByClassName('themeImg').item(1) as HTMLElement;
    let imgBorder3 = document.getElementsByClassName('themeImg').item(2) as HTMLElement;
    let imgBorder4 = document.getElementsByClassName('themeImg').item(3) as HTMLElement;
    let imgBorder5 = document.getElementsByClassName('themeImg').item(4) as HTMLElement;
    let imgBorder6 = document.getElementsByClassName('themeImg').item(5) as HTMLElement;

    let imgBtm1 = document.getElementsByClassName('imgBtm').item(0) as HTMLElement;
    let imgBtm2 = document.getElementsByClassName('imgBtm').item(1) as HTMLElement;
    let imgBtm3 = document.getElementsByClassName('imgBtm').item(2) as HTMLElement;
    let imgBtm4 = document.getElementsByClassName('imgBtm').item(3) as HTMLElement;
    let imgBtm5 = document.getElementsByClassName('imgBtm').item(4) as HTMLElement;
    let imgBtm6 = document.getElementsByClassName('imgBtm').item(5) as HTMLElement;

    function clearBtmBorder() {
      imgBorder1.style.removeProperty('border');
      imgBtm1.style.removeProperty('border');

      imgBorder2.style.removeProperty('border');
      imgBtm2.style.removeProperty('border');

      imgBorder3.style.removeProperty('border');
      imgBtm3.style.removeProperty('border');

      imgBorder4.style.removeProperty('border');
      imgBtm4.style.removeProperty('border');

      imgBorder5.style.removeProperty('border');
      imgBtm5.style.removeProperty('border');

      imgBorder6.style.removeProperty('border');
      imgBtm6.style.removeProperty('border');
    }


    let currentTheme = document.getElementById('currentTheme');
    if (theme == "theme1") {
      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q', 'Z556fbesgMPvm2U')
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211899/Rectangle_4_whcw4u.png)"
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Automobile";
        currentTheme.style.marginLeft = "-22px";
        clearBtmBorder()
        imgBorder2.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm2.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';

      } else {
        clearBtmBorder()
        document.getElementById("splitLeft").style.background = "white";
        imgBorder2.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm2.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      }
    } else if (theme == "theme2") {
      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q', 'CArCK4Vm5hyRF5B')
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211925/Rectangle_5_kflvow.png)"
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Dark Cloud";
        currentTheme.style.marginLeft = "-22px";
        clearBtmBorder()
        imgBorder3.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm3.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';

      } else {
        clearBtmBorder()
        document.getElementById("splitLeft").style.background = "white";
        imgBorder3.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm3.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      }
    } else if (theme == "theme3") {
      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q', '32J94BFgeC9zTNf')
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211929/Rectangle_6_bmdatg.png)"
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Landmark";
        currentTheme.style.marginLeft = "-30px";
        clearBtmBorder()
        imgBorder4.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm4.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';

      } else {
        clearBtmBorder()
        document.getElementById("splitLeft").style.background = "white";
        imgBorder4.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm4.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      }
    } else if (theme == "theme4") {
      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q', 'ShFzC9vBEcFz8Rk')
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211924/Rectangle_7_dff7kq.png)"
        document.getElementsByClassName('currentTheme')[0].innerHTML = "City View";
        currentTheme.style.marginLeft = "-30px";
        clearBtmBorder()
        imgBorder5.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm5.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';

      } else {
        clearBtmBorder()
        document.getElementById("splitLeft").style.background = "white";
        imgBorder5.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm5.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      }
    } else if (theme == "theme5") {
      if (typeof (Storage) !== "undefined") {
        localStorage.setItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q', 'XB8svCwGLr359na')
        document.getElementById("splitLeft").style.backgroundImage = "url(https://res.cloudinary.com/ros4eva/image/upload/v1582211913/Rectangle_8_rieqnp.png)"
        document.getElementsByClassName('currentTheme')[0].innerHTML = "Blue Sky";
        currentTheme.style.marginLeft = "-36px";
        clearBtmBorder()
        imgBorder6.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm6.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';

      } else {
        clearBtmBorder()
        document.getElementById("splitLeft").style.background = "white";
        imgBorder6.style.border = '1px solid rgba(0, 0, 0, 0.8)';
        imgBtm6.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
      }
    } else {
      localStorage.removeItem('w5tD6g7Z65evGCeKvCrgeDJpkk9zETRc7Vg3Cw4q')
      document.getElementById("splitLeft").style.background = "white";
      document.getElementsByClassName('currentTheme')[0].innerHTML = "Plain";
      currentTheme.style.marginLeft = "-55px";
      clearBtmBorder()
      imgBorder1.style.border = '1px solid rgba(0, 0, 0, 0.8)';
      imgBtm1.style.borderBottom = '1px solid rgba(0, 0, 0, 0.8)';
    }

  }
  
  logout() {
    this.dataService.logout();
  }

  filterUsers(userFilter) {
    userFilter.forEach(element => {
      this.users.push({
        'userColor': " ",
        'userName': element['user']['nickname'],
        'userID': element['user']['id'],
        'userTotalWeekHour': element['total_week_hours'],
        'scrumGoalSet': element['scrumgoal_set'].length
      });
      if (element['user']['nickname'] == this.loggedUser) {
        this.loggedUserId = element['user']['id']
      }
      element['scrumgoal_set'].forEach(item => {
        if (item['status'] == 0) {
          this.TFTW.push({
            'task': item['name'],
            'taskFor': element['user']['id'],
            'goalID': item['goal_project_id'],
            'timeCreated': item['time_created'],
            'file': item['file']
          })
        } if (item['status'] == 1) {
          this.TFTD.push({
            'task': item['name'],
            'taskFor': element['user']['id'],
            'goalID': item['goal_project_id'],
            'timeCreated': item['time_created'],
            'file': item['file']
          })
        } if (item['status'] == 2) {
          this.verify.push({
            'task': item['name'],
            'taskFor': element['user']['id'],
            'goalID': item['goal_project_id'],
            'pushID': item['push_id'],
            'timeCreated': item['time_created'],
            'file': item['file']
          })
        } if (item['status'] == 3) {
          this.done.push({
            'task': item['name'],
            'taskFor': element['user']['id'],
            'goalID': item['goal_project_id'],
            'pushID': item['push_id'],
            'timeCreated': item['time_created'],
            'file': item['file']
          })
        }
      })
    })
    // this.users.forEach(user => {
    //   for (let i = this.colors.length; i > 0; i--) {
    //     user['userColor'] = this.colors[Math.random() * this.colors.length | 0]
    //   }
    // })

    this.users.forEach(user => {
      user['userColor'] = this.colors[user.userID % this.colors.length]
    })
  }

  filterSprints(sprintFilter) {
    sprintFilter.forEach(element => {
      this.currentSprint.unshift({ 'sprintID': element['id'], 'dateCreated': element['created_on'], 'endDate': element['ends_on'] })
    });
    this.loggedSprint = this.currentSprint[0]
  }

  getAllUsersGoals () {
    this.dataService.allProjectGoals(this.project_id).subscribe(
      data => {
        this.loggedProject = data['project_name']
        this.participants = data['data']
        this.filterUsers(this.participants)
      },
  
    error => {
      console.log('error', Error)
    }
      )
    }

  changeLoggedSprint(selectedSprintID, createDate, endDate) {
    let sprint = selectedSprintID.getAttribute('sprintID');
    let sprintCreateDate = createDate.getAttribute('sprint-create-date');
    let sprintEndDate = endDate.getAttribute('sprint-end-date');
    this.loggedSprint.sprintID = sprint
    this.loggedSprint.dateCreated = sprintCreateDate
    this.loggedSprint.endDate = sprintEndDate
    this.currentSprint.shift()
    this.currentSprint.unshift({ 'sprintID': this.sprints[this.sprints.length - 1]['id'], 'dateCreated': this.sprints[this.sprints.length - 1]['created_on'], 'endDate': this.sprints[this.sprints.length - 1]['ends_on'] })
    
  }

  getAllSprints() {
    this.dataService.allSprints(this.project_id).subscribe(
      data => {
        this.sprints = data
        this.filterSprints(this.sprints)
        
      }, error => {
        console.log('error', error)
      }
    )
  }

  startSprint() {
    this.dataService.startSprintRequest(this.project_id).subscribe(
      data => {
        this.NotificationBox(data['message'])
        //window.top.location = window.top.location
        this.users = []
        this.sprints = []
        this.filterSprints(data['data'])
        this.filterUsers(data['users'])
        
      }, error => {
          if (error['status'] == 401) {
            this.NotificationBox('Session Invalid or Expired. Please Login!')
            this.dataService.logout();
          } else {
            this.NotificationBox('Unexpected Error!')
          }
      }
    )

  }

  startNewSprint() {
    if (Date.parse(this.loggedSprint.endDate) > new Date().valueOf()) {
      if (confirm(`Are You Sure You Want To End Sprint #${this.loggedSprint.sprintID} And Start A New Sprint?`)) {
        this.startSprint()
      }
    } else {
      this.startSprint()
    }
  }

  addTask() {
    if (this.goal_name != '') {
      this.dataService.goal_name = this.goal_name;
      this.dataService.addTaskRequest(this.project_id).subscribe(
        data => {
          this.NotificationBox(data['message'])
          this.users = []
          this.TFTD = []
          this.TFTW = []
          this.done = []
          this.verify = []
          this.filterUsers(data['data']);
          // if (data['message'] == "Goal created success.") {
          //   this.close()
          // }

        }, error => {
          if (error['status'] == 401) {
            this.NotificationBox('Session Invalid or Expired. Please Login!')
            this.dataService.logout();
          } else {
            this.NotificationBox('Add Task Failed!')
            this.close()
          }
        }
      )
    } else {
      this.close()
    }
    this.goal_name = '';
  }

  editTask() {
    this.dataService.taskToEdit = this.taskToEdit;
    this.dataService.editTaskRequest(this.project_id).subscribe(
      data => {
        this.NotificationBox(data['message'])
        this.users = []
        this.TFTD = []
        this.TFTW = []
        this.done = []
        this.verify = []
        this.filterUsers(data['data'])

        if (data['message'] == 'Goal Name Changed!') {
          this.close()
        }

      }, error => {
        if (error['status'] == 401) {
          this.NotificationBox('Session Invalid or Expired. Please Login!')
          this.dataService.logout();
        } else {
          this.NotificationBox('Edit Task Failed!')
          this.close()
        }
      }
    )
  }

  imageUploadAlert() {
    let name = document.getElementById('imgUpload') as HTMLInputElement;
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    if (name.value.length >= 1) {
      this.dataService.imageUploadRequest(this.project_id).subscribe(
        data => {
          this.NotificationBox(data['message'])
          this.users = []
          this.TFTD = []
          this.TFTW = []
          this.done = []
          this.verify = []
          this.filterUsers(data['data'])

          if (data['message'] == 'Goal Name Changed!') {
            this.close()
          }

        }, error => {
          if (error['status'] == 401) {
            this.NotificationBox('Session Invalid or Expired. Please Login!')
            //this.dataService.logout();
          } else {
            this.NotificationBox('Edit Task Failed!')
            this.close()
          }
          console.log(error)
        }
      )
    }
    uploadImageModal.style.display = 'none';
  }
  
}