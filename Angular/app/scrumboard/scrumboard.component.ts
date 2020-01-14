import { Component, OnInit } from '@angular/core';
import {Title} from "@angular/platform-browser";

@Component({
  selector: 'app-scrumboard',
  templateUrl: './scrumboard.component.html',
  styleUrls: ['./scrumboard.component.css']
})
export class ScrumboardComponent implements OnInit {

  constructor() { }

  ngOnInit() {
    this.load()
    this.rose()
    this.close()
    // this.imageName()
  }

  public imgName = "No image selected";
  public alert
  
  load(){
    window.onload = function() {
      $(".preloader").slideUp(1300);
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
    moda.style.display = "none";
    moda1.style.display = "none";
    hides.style.overflowY = "scroll";
    openEditTaskModal.style.display = "none";
    uploadImageModal.style.display = "none";
    taskHistoryModal.style.display = "none";

    
  }

  editTask () {
    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;
    openEditTaskModal.style.display = "block";
  }

  uploadImage() {
    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;
    uploadImageModal.style.display = "block";
  }

  taskHistory () {
    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;
    taskHistoryModal.style.display = "block";
  }



  rose(){
    let modal = document.getElementById("addTaskModal") as HTMLElement;
    let btnmod = document.getElementById("addTaskBtn") as HTMLElement;

    let modal1 = document.getElementById("addNoteModal") as HTMLElement;
    let btnmod1 = document.getElementById("addNoteBtn") as HTMLElement;

    let openEditTaskModal = document.getElementById("editTaskModal") as HTMLElement;

    let uploadImageModal = document.getElementById("uploadImageModal") as HTMLElement;

    let taskHistoryModal = document.getElementById("taskHistoryModal") as HTMLElement;

    let hides = document.getElementById("splitLeft") as HTMLElement;

    btnmod.onclick = function () {
      modal.style.display = "block";
    }

    btnmod1.onclick = function () {
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

   
}
