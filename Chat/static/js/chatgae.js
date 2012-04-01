var TimeToFade = 500;

function animateFade(lastTick, eid)
{  
  var curTick = new Date().getTime();
  var elapsedTicks = curTick - lastTick;
  
  var element = document.getElementById(eid);
 
  if(element.FadeTimeLeft <= elapsedTicks)
  {
    element.style.opacity = element.FadeState == 1 ? '1' : '0';
    element.style.filter = 'alpha(opacity = ' 
        + (element.FadeState == 1 ? '100' : '0') + ')';
    element.FadeState = element.FadeState == 1 ? 2 : -2;
    return;
  }
 
  element.FadeTimeLeft -= elapsedTicks;
  var newOpVal = element.FadeTimeLeft/TimeToFade;
  if(element.FadeState == 1)
    newOpVal = 1 - newOpVal;

  element.style.opacity = newOpVal;
  element.style.filter = 'alpha(opacity = ' + (newOpVal*100) + ')';
  
  setTimeout("animateFade(" + curTick + ",'" + eid + "')", 33);
}
function fade(eid)
{
  var element = document.getElementById(eid);
  if(element == null)
    return;
   
  if(element.FadeState == null)
  {
    if(element.style.opacity == null 
        || element.style.opacity == '' 
        || element.style.opacity == '1')
    {
      element.FadeState = 2;
    }
    else
    {
      element.FadeState = -2;
    }
  }
    
  if(element.FadeState == 1 || element.FadeState == -1)
  {
    element.FadeState = element.FadeState == 1 ? -1 : 1;
    element.FadeTimeLeft = TimeToFade - element.FadeTimeLeft;
  }
  else
  {
    element.FadeState = element.FadeState == 2 ? -1 : 1;
    element.FadeTimeLeft = TimeToFade;
    setTimeout("animateFade(" + new Date().getTime() + ",'" + eid + "')", 33);
  }  
}
function toggleChat(){
	fade('chatGaeFrameDiv');
	buttonE=document.getElementById('toggleChatGae');
	if(buttonE.innerHTML=="Hide Chat")
		buttonE.innerHTML="Show Chat";
	else if (buttonE.innerHTML=="Show Chat")
		buttonE.innerHTML="Hide Chat";
}
iframeStr="<iframe style='border-radius:10px;box-shadow:#ccc 0px 0px 15px;background-color:white' src='http://chatgae.appspot.com/Chat/default/index?f=1' frameborder='0' scrolling='no' width='75%' height='75%'><noframes>Sorry your browser doesn't support ChatGAE</noframes></iframe>";
divStr="<div id='chatGaeFrameDiv' style='opacity:0;position:fixed;top:0px;width:100%;height:100%;overflow:hidden;left:"+(window.innerWidth/8)+"px'>"+iframeStr+"</div><button id='toggleChatGae' style='position:fixed;top:0px;right:0px' onclick=\"toggleChat()\">Show Chat</button>";
document.write(divStr);
//http://chatgae.appspot.com
