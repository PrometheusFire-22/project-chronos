/* NOTE: This script is taken from https://browser-update.org/ */
var $buoop = {
	reminder: 0,
	l: false,
	//test: true,
	text: 'Your browser is <b>out of date</b> and is <b>not supported</b> by our website. Please consider upgrading your browser. <a target="_SELF" href="//browser-update.org/update.html">Learn how to update your browser</a>'
}; 
function $buo_f(){ 
 var e = document.createElement("script"); 
 e.src = STATIC_URL + "js/libs/browser-update-org.js"; 
 document.body.appendChild(e);
};
try {document.addEventListener("DOMContentLoaded", $buo_f,false)}
catch(e){window.attachEvent("onload", $buo_f)}