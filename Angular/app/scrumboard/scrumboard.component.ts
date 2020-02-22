import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';

@Component({
  selector: 'app-scrumboard',
  templateUrl: './scrumboard.component.html',
  styleUrls: ['./scrumboard.component.css']
})
export class ScrumboardComponent implements OnInit {

  constructor(private http: HttpClient, private router: Router) { }

  ngOnInit() {
    this.load()
    this.rose()
    this.close()
    this.closeAllDropDown()
    // this.imageName()
  }

  public imgName = "No image selected";
  public alert;
  
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
    moda.style.display = "none";
    moda1.style.display = "none";
    hides.style.overflowY = "scroll";
    openEditTaskModal.style.display = "none";
    uploadImageModal.style.display = "none";
    taskHistoryModal.style.display = "none";
    logoutModal.style.display = "none";
    appInfoModal.style.display = "none";
    userProfileModal.style.display = "none";

    
  }

  editTask () {
    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;
    openEditTaskModal.style.display = "block";
  }

  uploadImage () {
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    uploadImageModal.style.display = "block";
  }

  taskHistory () {
    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;
    taskHistoryModal.style.display = "block";
  }

  userProfile () {
    let userProfileModal = document.getElementById("userProfileModal") as HTMLElement;
    userProfileModal.style.display = "block"
  }

  appInfo () {
    let appInfoModal = document.getElementById("appInfoModal") as HTMLElement;
    appInfoModal.style.display = "block"
  }

  logout () {
    let logoutModal = document.getElementById("logoutModal") as HTMLElement;
    logoutModal.style.display = "block"
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
    let logoutModal = document.getElementById("logoutModal") as HTMLElement;
    let appInfoModal = document.getElementById("appInfoModal") as HTMLElement;

    let hides = document.getElementById("splitLeft") as HTMLElement;

    let ttAddTask = document.getElementById("ttAddTaskBtn") as HTMLElement;
    let ttAddNote = document.getElementById("ttAddNoteBtn") as HTMLElement;
    let ttUserHistory = document.getElementById("ttUserHistoryBtn") as HTMLElement;

    btnmod.onclick = function () {
      modal.style.display = "block";
    }

    ttAddTask.onclick = function () {
      modal.style.display = "block";
    }

    btnmod1.onclick = function () {
      modal1.style.display = "block";
    }

    ttAddNote.onclick = function () {
      modal1.style.display = "block";
    }

    window.onclick = function (event) {
      if (event.target == modal) {
        modal.style.display = 'none';
      }

      if (event.target == modal1) {
        modal1.style.display = 'none';
        hides.style.overflowY = "scroll";
      }

      if(event.target == openEditTaskModal) {
        openEditTaskModal.style.display = "none";
      }

      if (event.target == uploadImageModal) {
        uploadImageModal.style.display = "none";
      }

      if (event.target == taskHistoryModal) {
        taskHistoryModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (event.target == userProfileModal) {
        userProfileModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (event.target == appInfoModal) {
        appInfoModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

      if (event.target == logoutModal) {
        logoutModal.style.display = "none";
        hides.style.overflowY = "scroll";
      }

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
  }


  imageUploadAlert () {
    let name = document.getElementById('imgUpload') as HTMLInputElement;
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    if(name.value.length >= 1) {
      uploadImageModal.style.display = "none";
      this.NotificationBox("Image Uploaded Successfully");
    }
  }

  copyToClipboard(containerId) {
    let range = document.createRange();
    range.selectNode(document.getElementById(containerId));
    window.getSelection().removeAllRanges();
    window.getSelection().addRange(range);
    document.execCommand("copy");
    window.getSelection().removeAllRanges();
    this.NotificationBox("Copied to clipboard!")
  }

  showTeamTaskDropDown() {
    let dropDownCBtn = document.getElementById('ttDropDown');
    let toggled = document.getElementById('toggledDown');
    let untoggled = document.getElementById('toggledUp');
    let ttDropDownMenu = document.getElementById('teamTaskDropDownMenu');
    let ttDropDownMenu1 = document.getElementById('teamTaskDropDownMenu1');
    
    dropDownCBtn.classList.toggle('showDropDown');
    ttDropDownMenu.classList.toggle('teamTaskDropDownMenuToggle');
    
    
    if (untoggled.className == 'fas fa-chevron-up') {
      untoggled.className = ('fas fa-chevron-down')
      ttDropDownMenu1.style.marginTop = "1100px"

    } else if (untoggled.className == 'fas fa-chevron-down') {
      untoggled.className = ('fas fa-chevron-up')
      ttDropDownMenu1.style.marginTop = "20px"
    }
    
    
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

  closeAllDropDown() {
    function hideDropDown(element, classToRemove, classToAdd) {
      element.classList.remove(classToRemove)
      element.classList.add(classToAdd)
    }
    window.onclick = function (e) {
      let projectDD = document.getElementById('projectsDDContent') as HTMLElement;
      let themeDD = document.getElementById('themeDDContent') as HTMLElement;
      let sprintDD = document.getElementById('sprintDDContent') as HTMLElement;
      let target = e.target as HTMLElement
      if (target.matches('a#themeTab') || target.matches('span#currentTheme')) {
        hideDropDown(themeDD, undefined ,'ppDD')
      } else if (target.matches('img.themeImg')) {
        hideDropDown(themeDD, undefined,'ppDD')
      } else if (target.matches('a#sprintTab') || target.matches('span.loggedSprint')) {
        hideDropDown(sprintDD, undefined,'spDD')
      } else if (target.matches('a#projectsTab') || target.matches('span.loggedProject')) {
        hideDropDown(projectDD, undefined, 'ppDD')
      } else {
        document.getElementById('projectsDDContent').classList.add('animateDD');
        document.getElementById('sprintDDContent').classList.add('animateDD');
        document.getElementById('themeDDContent').classList.add('animateDD');
        setTimeout("document.getElementById('projectsDDContent').classList.remove('ppDD')", 1000);
        setTimeout("document.getElementById('sprintDDContent').classList.remove('spDD')", 1000);
        setTimeout("document.getElementById('themeDDContent').classList.remove('ppDD')", 1000);
        setTimeout("document.getElementById('projectsDDContent').classList.remove('animateDD')", 1000);
        setTimeout("document.getElementById('sprintDDContent').classList.remove('animateDD')", 1000);
        setTimeout("document.getElementById('themeDDContent').classList.remove('animateDD')", 1000);
      }
    }
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
   
}