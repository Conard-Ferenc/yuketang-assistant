// ==UserScript==
// @name         雨课堂助手
// @namespace    https://github.com/Conard-Ferenc/yuketang-assistant
// @version      1.3.1
// @description  完全加载页面3秒后，获取雨课堂试卷答案
// @author       Conard
// @match        https://changjiang.yuketang.cn/*
// @icon         https://changjiang.yuketang.cn/static/images/favicon.ico
// @license      MIT
// @noframes
// ==/UserScript==

(function () {
  'use strict';
  const js = document.createElement("script");
  js.innerHTML = `class Move{clickstatus = false;lastX = 0;lastY = 0;lastcX = 0;lastcY = 0;moveObject = undefined;mousedown(e){const target = e.target.className;if(target.includes("title")){this.clickstatus = true;this.moveObject = document.getElementById("tip");this.lastX = this.moveObject.offsetLeft;this.lastY = this.moveObject.offsetTop;this.lastcX = e.clientX;this.lastcY = e.clientY}}mousemove(e){if(this.clickstatus){this.moveObject.style.left = this.lastX+(e.clientX - this.lastcX)+"px";this.moveObject.style.top = this.lastY+(e.clientY - this.lastcY)+"px"}}mouseup(e){this.clickstatus = false;this.lastX = 0;this.lastY = 0;this.lastcX = 0;this.lastcY = 0}}const move = new Move();document.addEventListener("mousedown",move.mousedown);document.addEventListener("mousemove",move.mousemove);document.addEventListener("mouseup",move.mouseup);`;
  document.head.appendChild(js);
  const style = document.createElement("style");
  style.innerHTML = `.tip{z-index:2001;min-width:150px;max-width:300px;min-height:200px;max-height:70vh;position:absolute;top:100px;left:200px;background-color:aqua;-webkit-box-shadow:1px 1px 3px #292929;-moz-box-shadow:1px 1px 3px #292929;box-shadow:1px 1px 3px #292929;border-radius:10px;overflow:overlay;}.tiphidden{display:none}.tip>.title{display:block;height:30px;background-color:cornflowerblue;color:#fff;text-align:center;user-select:none;line-height:30px;cursor:grab;position:sticky;top:0;}.tip>.content{padding:4px}.title:active{cursor:grabbing!important}`;
  document.head.appendChild(style);
  const tip = document.createElement("div");
  tip.classList.add("tip", "tiphidden");
  tip.setAttribute("id", "tip");
  tip.innerHTML = `<a class="title">雨课堂助手</a><div id="content" class="content"></div>`;
  document.body.appendChild(tip);
  const content = document.getElementById("content");
  const pluginMap = {
    studentQuiz: () => {
      setTip();
      return setTimeout(getAns, 3000);
    },
    studentCards: () => {
      setTip();
      return autoCWare();
    },
    studentLesson: (id) => {
      setTip();
      return autoBulletChat(id);
    },
  }
  let nowPlugin;
  document.querySelector("div#app").__vue__.$router.afterHooks.push((e) => {
    console.log(e);
    const { path } = e;
    let [, key, id] = path.split("/");
    console.log(path, key);
    if (location.href.includes("/lesson/fullscreen/v3/")) key = "studentLesson";
    if (nowPlugin !== key && pluginMap[key]) {
      nowPlugin = key;
      return pluginMap[key](id);
    } else if (nowPlugin === key) return;
    return setTip(true);
  });
  const setTip = (hidden) => (hidden ? tip.classList.add("tiphidden") : (tip.classList.remove("tiphidden"), (content.innerHTML = "")));
  const getAns = () => {
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
    content.innerHTML = `<input id="sec-value" type="number" max="40" min="5" value="5" />sec <button id="run-button">开始挂机</button>`;
    document.querySelector("button#run-button").addEventListener("click", (e) => {
      let seconds = document.querySelector("#sec-value").value * 1 || 5;
      console.log(e);
      const list = document.querySelectorAll(".thumbImg-container");
      const deep = list.length;
      let index = 0;
      let time = setInterval(() => {
        if (index >= deep) return clearInterval(time);
        list[index++].click();
      }, seconds * 1000);
    });
  };
  const autoBulletChat = (lessonId) => {
    console.log(lessonId);
    content.innerHTML = `<input id="chat-value" type="text" value="" placeholder="输入定时发送内容" /><br/><input id="min-value" type="number" max="30" min="1" value="5" />min <button id="run-button">开始挂机</button>`;
    let time;
    document.querySelector("button#run-button").addEventListener("click", (e) => {
      let message = document.querySelector("#chat-value").value;
      let minutes = document.querySelector("#min-value").value * 1 || 5;
      if (time || message.match(/^\s*$/)) {
        clearInterval(time);
        console.log("stop last interval")
        return (time = undefined);
      }
      console.log("message:", message, "\ntime:", minutes);
      const sent = () => {
        fetch("https://changjiang.yuketang.cn/api/v3/lesson/danmu/send", {
          headers: {
            "accept": "application/json, text/plain, */*",
            "accept-language": "zh-CN,zh;q=0.9,en;q=0.8,en-GB;q=0.7,en-US;q=0.6",
            "authorization": `Bearer ${localStorage.getItem("Authorization")}`,
            "content-type": "application/json;charset=UTF-8",
            "sec-ch-ua": "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Microsoft Edge\";v=\"104\"",
            "sec-ch-ua-mobile": "?0",
            "sec-ch-ua-platform": "\"Windows\"",
            "sec-fetch-dest": "empty",
            "sec-fetch-mode": "cors",
            "sec-fetch-site": "same-origin",
            "x-client": "h5",
            "xtbz": "ykt"
          },
          referrer: "https://changjiang.yuketang.cn/lesson/fullscreen/v3/703749584166119168/exercise/49",
          referrerPolicy: "strict-origin-when-cross-origin",
          body: JSON.stringify({ lessonId, target: "", userName: "", message, extra: "", requiredCensor: false, wordCloud: true, showStatus: true, formStart: "50" }),
          method: "POST",
          mode: "cors",
          credentials: "include"
        });
      };
      time = setInterval(() => {
        sent();
      }, minutes * 60 * 1000);
    });
  }

})();