// ==UserScript==
// @name         雨课堂考试答案获取
// @namespace    https://github.com/Conard-Ferenc
// @version      0.3
// @description  完全加载页面3秒后，获取雨课堂考试答案
// @author       Conard
// @match        https://changjiang.yuketang.cn/v2/web/studentQuiz/*
// @icon         https://changjiang.yuketang.cn/static/images/favicon.ico
// @license      MIT
// ==/UserScript==

(function () {
  'use strict';
  const tip = document.createElement('div');
  tip.classList.add('tip');
  tip.setAttribute('id', 'tip');
  tip.innerHTML = `<a class="title">雨课堂助手</a><div id="content" class="content"></div><style>.tip{z-index:2001;min-width:150px;max-width:300px;min-height:200px;position:absolute;top:100px;left:200px;background-color:aqua;-webkit-box-shadow:1px 1px 3px #292929;-moz-box-shadow:1px 1px 3px #292929;box-shadow:1px 1px 3px #292929;border-radius:10px;overflow:hidden}.title{display:block;height:30px;background-color:cornflowerblue;color:#fff;text-align:center;user-select:none;line-height:30px;cursor:grab}.content{padding:4px}.title:active{cursor:grabbing!important}</style>`;
  document.body.appendChild(tip);
  const js = document.createElement('script');
  js.innerHTML = `class Move{clickstatus = false;lastX = 0;lastY = 0;lastcX = 0;lastcY = 0;moveObject = undefined;mousedown(e){const target = e.target.className;if(target.includes("title")){this.clickstatus = true;this.moveObject = document.getElementById("tip");this.lastX = this.moveObject.offsetLeft;this.lastY = this.moveObject.offsetTop;this.lastcX = e.clientX;this.lastcY = e.clientY}}mousemove(e){if(this.clickstatus){this.moveObject.style.left = this.lastX+(e.clientX - this.lastcX)+"px";this.moveObject.style.top = this.lastY+(e.clientY - this.lastcY)+"px"}}mouseup(e){this.clickstatus = false;this.lastX = 0;this.lastY = 0;this.lastcX = 0;this.lastcY = 0}}const move = new Move();document.addEventListener("mousedown",move.mousedown);document.addEventListener("mousemove",move.mousemove);document.addEventListener("mouseup",move.mouseup);`
  document.head.appendChild(js);
  const getans = () => {
    let quizObj = document.getElementById('rainiframe').contentWindow.quizData;
    const ans = quizObj.Slides.map((item) => {
      let outAns = item.Problem.Answer;
      if (outAns) return outAns;
      try {
        const ansList = item.Problem.Blanks.map((citem) => {
          return citem.Answers.join('或')
        })
        return ansList.join('，')
      } catch (err) {
        return "老师未设置答案或题型暂不支持"
      }
    })
    console.log(ans)
    const content = document.getElementById('content')
    ans.forEach((item, index) => {
      content.innerHTML += `${index + 1}.&nbsp;${item}<br/>`
    })
  }
  setTimeout(getans, 3000);
})();