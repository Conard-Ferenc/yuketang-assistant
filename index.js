// ==UserScript==
// @name         雨课堂助手
// @namespace    https://github.com/Conard-Ferenc
// @version      1.2
// @description  完全加载页面3秒后，获取雨课堂考试答案
// @author       Conard
// @match        https://changjiang.yuketang.cn/v2/web/*
// @icon         https://changjiang.yuketang.cn/static/images/favicon.ico
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';
  const js = document.createElement("script");
  js.innerHTML = `class Move{clickstatus = false;lastX = 0;lastY = 0;lastcX = 0;lastcY = 0;moveObject = undefined;mousedown(e){const target = e.target.className;if(target.includes("title")){this.clickstatus = true;this.moveObject = document.getElementById("tip");this.lastX = this.moveObject.offsetLeft;this.lastY = this.moveObject.offsetTop;this.lastcX = e.clientX;this.lastcY = e.clientY}}mousemove(e){if(this.clickstatus){this.moveObject.style.left = this.lastX+(e.clientX - this.lastcX)+"px";this.moveObject.style.top = this.lastY+(e.clientY - this.lastcY)+"px"}}mouseup(e){this.clickstatus = false;this.lastX = 0;this.lastY = 0;this.lastcX = 0;this.lastcY = 0}}const move = new Move();document.addEventListener("mousedown",move.mousedown);document.addEventListener("mousemove",move.mousemove);document.addEventListener("mouseup",move.mouseup);`;
  document.head.appendChild(js);
  const style = document.createElement("style");
  style.innerHTML = `.tip{z-index:2001;min-width:150px;max-width:300px;min-height:200px;max-height:70vh;position:absolute;top:100px;left:200px;background-color:aqua;-webkit-box-shadow:1px 1px 3px #292929;-moz-box-shadow:1px 1px 3px #292929;box-shadow:1px 1px 3px #292929;border-radius:10px;overflow:overlay;}.tiphidden{display:none}.tip>.title{display:block;height:30px;background-color:cornflowerblue;color:#fff;text-align:center;user-select:none;line-height:30px;cursor:grab;position:sticky;top:0;}.content{padding:4px}.title:active{cursor:grabbing!important}`;
  document.head.appendChild(style);
  const tip = document.createElement("div");
  tip.classList.add("tip", "tiphidden");
  tip.setAttribute("id", "tip");
  tip.innerHTML = `<a class="title">雨课堂助手</a><div id="content" class="content"></div>`;
  document.body.appendChild(tip);
  const content = document.getElementById("content");
  document.querySelector("div#app").__vue__.$router.afterHooks.push((e) => {
    console.log(e);
    const { path } = e;
    let key = path.split("/")[1];
    console.log(path, key);
    switch (key) {
      case "studentQuiz":
        setTip();
        setTimeout(getans, 3000);
        break;
      case "studentCards":
        setTip();
        autoCWare();
        break;
      default:
        setTip(true);
        break;
    }
  });
  const setTip = (hidden) => (hidden ? tip.classList.add("tiphidden") : (tip.classList.remove("tiphidden"), (content.innerHTML = "")));
  const getans = () => {
    let quizObj = document.getElementById("rainiframe").contentWindow.quizData;
    const ans = quizObj.Slides.filter((item) => item.Problem).map((item) => {
      let outAns = item.Problem.Answer;
      if (outAns) return outAns;
      try {
        const ansList = item.Problem.Blanks.map((citem) => {
          return citem.Answers.join("或");
        });
        return ansList.join("，");
      } catch (err) {
        return "老师未设置答案或题型暂不支持";
      }
    });
    console.log(ans);
    ans.forEach((item, index) => {
      content.innerHTML += `${index + 1}.&nbsp;${item}<br/>`;
    });
  };
  const autoCWare = () => {
    content.innerHTML = `<input id="sec-value" type="number" max="40" min="5" value="5" /><button id="run-button">开始挂机</button>`;
    let seconds = document.querySelector("#sec-value").value * 1 || 5;
    document.querySelector("button#run-button").addEventListener("click", (e) => {
      console.log(e);
      const list = document.querySelectorAll(".thumbImg-container");
      const deep = list.length;
      let index = 0;
      let time = setInterval(() => {
        if (index >= deep) {
          clearInterval(time);
          return;
        }
        list[index++].click();
      }, seconds * 1000);
    });
  };

})();