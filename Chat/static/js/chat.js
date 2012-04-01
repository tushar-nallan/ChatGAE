$(document).ready(function(){
    var chat_token = $('#channel_api_params').attr('chat_token');
    var channel = new goog.appengine.Channel(chat_token);
    var socket = channel.open();
    socket.onopen = function(){
    };
    socket.onmessage = function(m){
        var data = $.parseJSON(m.data);
        if(data['type']=='chat')
        {
            showChatBox(data['from']);
            $('#chatBoxMessageContainer'+data['from']).append(data['html']);
            var objDiv = document.getElementById("chatBoxMessageContainer"+data['from']);
            objDiv.scrollTop = objDiv.scrollHeight;
        }
        else if(data['type']=='groupChat'){
            groupCharIds=eval(data['userIds']);
//            alert(data['userIds']);
//            alert(groupCharIds);
            $("#groupMemNames").html(data['userNames']);
//            alert("Set the head");
            $("#groupChat").show();
//            alert("Showing dabba");
            $('#chatBoxMessageContainerGroup').append(data['html']);
//            alert("appending data");
            var objDiv = document.getElementById("chatBoxMessageContainerGroup");
            objDiv.scrollTop = objDiv.scrollHeight;
//            alert("Moved dabba up");
        }
        else if(data['type']=='Available')
        {
            $("#friend"+data['userId']).removeClass("offline online busy").addClass("online");
        }
        else if(data['type']=='Busy')
        {
            $("#friend"+data['userId']).removeClass("offline online busy").addClass("busy");
        }
        else if((data['type']=='Invisible')||(data['type']=='offline'))
        {
            $("#friend"+data['userId']).removeClass("offline online busy").addClass("offline");
        }
        else if(data['type']=='addFriend')
        {
            $("#frndReqs").append("<div id='reqUserId"+data['userId']+"' class='addReq'>Accept "+data['name']+"</div><span class='yesnobuttons' id='yesnobuttons"+data['userId']+"'><button onclick='sendReqDec(true,"+data['userId']+")'>Ok</button> <button onclick='sendReqDec(false,"+data['userId']+")'>No</button><br/></span>");
        }
        else if(data['type']=='addedFriend')
        {
            addNewFriend(data['userId'],data['name'],data['statusFlag'],data['offline']);
        }
        else if(data['type']=='vidToks'){
//            alert("recieved vidTok:"+data['vidTok']);
            showChatBox(data['userId']);
            startSelfVidChat('vid'+data['userId']);
//            alert("Just before startOther");
            startOtherVidChat(data['userId'],data['vidTok']);
        }
        else if(data['type']=='actualStatusChange'){
//            alert("got stat change");
            userStatusDiv=$("#friend"+data['userId']).next();
            if(userStatusDiv.attr('id')=='status'+data['userId']){
                userStatusDiv.html(data['newStatus']);
            }
        }
    };
    socket.onerror =  function(err){
    };
    socket.onclose =  function(){
        alert("channel closed");
    };
    
    $(window).unload(function (){
        $.post('/Chat/default/setOffline/', {userId:$("#selfInfo").attr("value"),flag:'Available'});
    });
});
function closeChatBox(userId){
    if(userId=='Group')
    {
        $("#groupChat").hide();
        return;
    }
    $("#user"+userId).hide();
    if(userId==toUserVidChat){
        $("#selfVidBox").remove();
        $("#vidBox"+userId).remove();
    }
}
function textAreaKeyDown(event,userId)
{
    if(event.keyCode == 13)
        sendMessage(userId);
    else if(event.keyCode == 27)
        closeChatBox(userId);
}
function addNewFriend(userId,userName,statusFlag,offline){
    var icon;
    if(statusFlag=='Available') icon='online';
    else if(statusFlag=='Busy') icon='busy';
    if((offline=='True')||(statusFlag=='Invisible'))
        $("#friends_list").append("<div class='friend offline' id='friend"+userId+"' value="+userId+">"+userName+"</div>");
    else
        $("#friends_list").append("<div class='friend "+icon+"' id='friend"+userId+"' value="+userId+">"+userName+"</div>");
    initFriends();
}
function sendFriendReq(event){
    if(event.keyCode == 13)
    {
        $.ajax({
            url: '/Chat/default/addFriend/',
            type: 'POST',
            data:{
                email:$("#addFriend").val()
            },
            success: function(data){
                $("#addFriend").val('');
                if(data=='nouser')
                    alert('There is no user with that Email-Id');
            }
        });
    }
    else if(event.keyCode == 27)
    {
        $("#addFriend").val('');
    }
}
function sendReqDec(flag,userId){
    $.ajax({
        url: '/Chat/default/decFriendReq/',
        type: 'POST',
        data:{
            flag:flag,
            userId:userId
        },
        success: function(data){
            var jsonData = $.parseJSON(data);
            if(flag==true){
                addNewFriend(userId,$('#reqUserId'+userId).html().substr(6),jsonData['statusFlag'],jsonData['offline']);
            }
            $("#reqUserId"+userId).remove();
            $("#yesnobuttons"+userId).remove();
        }
    });
}
function sendMessage(userId){
    var message = $('#textarea'+userId).val();
    var channel_id = $('#channel_api_params').attr('channel_id');
    if(userId!='Group'){
        $.ajax({
            url: '/Chat/default/messages/',
            type: 'POST',
            data:{
                text:message,
                userId:userId,
            },
            success: function(data){
                $('#textarea'+userId).val('');
                $('#chatBoxMessageContainer'+userId).append(data);
                var objDiv = document.getElementById("chatBoxMessageContainer"+userId);
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        });
    }
    else{
        groupCharIdsStr=groupCharIds.toString();
//        alert(groupCharIdsStr);
        $.ajax({
            url: '/Chat/default/groupMessages/',
            type: 'POST',
            data:{
                text:message,
                userIds:groupCharIdsStr
            },
            success: function(data){
                $('#textareaGroup').val('');
                $('#chatBoxMessageContainerGroup').append(data);
                var objDiv = document.getElementById("chatBoxMessageContainerGroup");
                objDiv.scrollTop = objDiv.scrollHeight;
            }
        });
    }
}
function getFlashMovie(movieName) {
    var isIE = navigator.appName.indexOf("Microsoft") != -1;
    return (isIE) ? window[movieName] : document[movieName];
}
function showChatBox(userId){
    if($("#user"+userId).html()!=null)
    {
        $("#user"+userId).show();
    }
    else{
        //adding chat boxes 
        var chatBox = document.createElement("div");
        chatBox.setAttribute("id","user"+userId);
        chatBox.setAttribute("class","chatbox");

        var headerContainer = document.createElement("div");
        headerContainer.setAttribute("class","headerContainer");

        var closeButton = document.createElement("a");
        closeButton.innerHTML="X";
        closeButton.setAttribute("class","closeButton");
        closeButton.setAttribute("onclick","closeChatBox("+userId+")");
        headerContainer.appendChild(closeButton);

        var headerMessage = document.createElement("p");
        headerMessage.setAttribute("class","headerMessage");
        headerMessage.innerHTML = "<b>"+$("#friend"+userId).html()+"</b><img class='vidChat' id='vid"+userId+"' onclick='startSelfVidChat(this.id)' src='/Chat/static/images/chat16/video.png'/><br /><br />";
        headerContainer.appendChild(headerMessage);

        chatBox.appendChild(headerContainer);
        var chatBoxMessagesContainer = document.createElement("div");
        chatBoxMessagesContainer.setAttribute("class","chatBoxMessagesContainer");
        chatBoxMessagesContainer.setAttribute("id","chatBoxMessageContainer"+userId);
        chatBox.appendChild(chatBoxMessagesContainer);
        
        /*if($("#friend"+userId).hasClass("offline")){
            var offlineNotif = document.createElement("div");
            offlineNotif.style.position='absolute';
            offlineNotif.style.bottom='0px';
            offlineNotif.style.color='grey';
            offlineNotif.innerHTML="This User is Offline";
            chatBoxMessagesContainer.appendChild(offlineNotif);
        }*/

        var chatBoxMessagesTextarea = document.createElement("div");
        var offlineText="";
        if($("#friend"+userId).hasClass("offline")){
            offlineText="placeholder='This User is Offline'";
        }
        var textareaStr = "<textarea class='chatTextArea' id='textarea"+userId+"' cols='25' rows='2' onkeydown='textAreaKeyDown(event,"+userId+")'"+offlineText+"></textarea>";
        chatBox.innerHTML += textareaStr ;

        var submitButton = document.createElement("input");
        submitButton.setAttribute("type","button");
        submitButton.setAttribute("value","send");
        submitButton.setAttribute("id","submitButton"+userId);
        submitButton.setAttribute("onclick","sendMessage("+userId+")");

        chatBox.appendChild(document.createElement("br"));

        document.getElementById("chats").appendChild(chatBox);
    }                             
}
function changeStatus(flag){
    $.ajax({
        url: '/Chat/default/setFlag/',
        type: 'POST',
        data:{
            flag:flag,
            userId:$("#selfInfo").attr('value')
        },
        success: function(data){
            var statFlag='';
            if(data=='Available') statFlag='online';
            else if(data=='Busy') statFlag='busy';
            else if(data=='Invisible') statFlag='offline';
            $("#selfInfo").removeClass("online offline busy").addClass(statFlag);
        }
    });
}
function initFriends(){
    $('#friends_list .friend').mouseenter(function(){
        $(this).css('background-color','#ddd');
    }).mouseout(function(){
        $(this).css('background-color','transparent');
    }).click(function(){
        thisUserId=$(this).attr('value');
        if(thisUserId!=undefined)
        {
            showChatBox(thisUserId);
            $("#textarea"+thisUserId).focus();
        }
    });
}

function changeActualStatus(){
    newStatus=$("#changeStatusInput").val();
    $.ajax({
        url:"/Chat/default/changeActualStatus",
        type:"POST",
        data:{
            newStatus:newStatus
        },
        success:function(data){
            if(data=="True")
            {
                $("#statusBar").html(newStatus);
                $("#changeStatus").hide();
            }
            else
                alert("Sorry Something went wrong, Try again");
        }
    });
}
function startGroupChat(){
    jcnt=0;
    $("#groupMemNames").html('');
    selected=new Array();
    for(jcnt=0;jcnt<$('.friend').length;jcnt++){if($($('.friend')[jcnt]).html()=='-Group Chat-') continue;
        userId=$('.friend')[jcnt].id.substr(6);
        if($("#addF"+userId).attr('checked')=='checked')
        {
            selected.push(userId);
            $("#groupMemNames").html($("#groupMemNames").html()+$("#nameF"+userId).html()+",");
        }
    }
    if(selected.length<2)
    {
        alert("Please selected 2 or more members");
        return;
    }
    groupCharIds=selected;
    $("#groupChat").show();
    $("#userIdsForGroupChat").remove();
}
function selectGroup(){
    if($('.friend').length<3) {alert('Please add some friends');return;}
    if(document.getElementById("userIdsForGroupChat")!=null) return;
    addUsersForm="";
    icnt=0;
    for(icnt=0;icnt<$('.friend').length;icnt++){if($($('.friend')[icnt]).html()=='-Group Chat-') continue;
        addUsersForm+="<label><input type='checkbox' id='addF"+$('.friend')[icnt].id.substr(6)+"' />"+"<span id='nameF"+$('.friend')[icnt].id.substr(6)+"'>"+ $($('.friend')[icnt]).html()+"</span></label><br/>";
    }
    addUsersForm+="<button onclick=\"startGroupChat()\">Start Group Chat</button>"
    showToUser="<div id='userIdsForGroupChat' style='position:fixed;padding:20px;border:2px solid grey;left:"+window.innerWidth/2+"px;"+"top:"+window.innerHeight/2+"px;'><div onclick=\"$('#userIdsForGroupChat').remove()\" style='position:absolute;top:0px;right:0px;cursor:pointer'>X</div>"+addUsersForm+"</div>";
    $("body").append(showToUser);
}
$(document).ready(function(){
    initFriends();
    $("#statusBar").click(function(){
        $("#changeStatus").show();
        $("#changeStatusInput").focus();
    });
    $("#changeStatusInput").focusout(function(){
        $("#changeStatus").hide();
    });
    $("#changeStatusInput").keydown(function(e){
        if(e.keyCode==13){
            changeActualStatus();
        }
        if(e.keyCode==27){
             $("#changeStatus").hide();
        }
    });
    $("#startGroupChat").click(function(){
        selectGroup();
    });
});
