var Notepad = function(numOfNotes) {
	/* TODO: 그 외에 또 어떤 클래스와 메소드가 정의되어야 할까요? */
	var container = $('<div class="contatiner notepad" numOfNotes="' + numOfNotes  + '""></div>');	
	var div = $('<div class="col-xs-12 col-sm-6 col-sm-offset-3"> </div>');
	var ul = $('<ul class="nav nav-tabs"></ul>');
	var textarea = $('<textarea class="form-control" rows = "20"></textarea>');
	var buttonGroup = $('<div class="btn-group"></div>');
	var loadButton = $('<button class="btn btn-default">불러오기</button>');
	var saveButton = $('<button class="btn btn-default">저장하기</button>');
	var newButton = $('<button class="btn btn-default">새 파일</button>');


	
	container.append(div);
	div.append(ul);
	div.append(textarea);
	buttonGroup.append(loadButton);
	buttonGroup.append(saveButton);
	buttonGroup.append(newButton);
	div.append(buttonGroup);

	for(var i = 0; i < numOfNotes; i++) {
		var li=$('<li id="' + i + '"><a>note' + i + '</a></li>');
		li.on('click', function(e) {
			$('li').removeClass('active');
			$(this).addClass('active');
			loadFile();
		});
		ul.append(li);
	}

	loadButton.on('click', loadFile);
	saveButton.on('click', saveFile);
	newButton.on('click', function(e) {
		var notepad = $(".notepad");
		var numOfNotes = parseInt(notepad.attr("numOfNotes"));
		var ul = $('ul');
		var li=$('<li id="' + numOfNotes + '"><a>note' + numOfNotes + '</a></li>');
		li.on('click', function(e) {
			$('li').removeClass('active');
			$(this).addClass('active');
			loadFile();
		});
		ul.append(li);
		notepad.attr("numOfNotes", numOfNotes + 1);
	});	

	ul.children().first().addClass("active");
	$('body').append(container);
	loadFile();
};

var loadFile = function() {
	var noteName = $('.active').first().attr('id');
	var url = '/note?id=' + noteName;
	
	var xhttp = new XMLHttpRequest(); /*js 기본 탑재 클래스*/
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200) {
				$('textarea').first().val(xhttp.responseText); /*value를 괄호 안의 것으로 바꿔줌*/	
			} else { alert("파일을 불러오지 못했습니다."); }
		}
	};
	xhttp.open("GET", url, true);
	xhttp.send();
};

var saveFile = function() {
	var noteName = $('.active').first().attr('id');
	var url = '/note?id=' + noteName;

	var xhttp = new XMLHttpRequest();
	xhttp.onreadystatechange = function() {
		if(this.readyState == 4) {
			if(this.status == 200) {
				alert("파일이 성공적으로 저장되었습니다.");
			}
			else {
				alert("파일 저장에 실패하였습니다.");
			}
		}
	};
	xhttp.open("POST", url, true);
	xhttp.setRequestHeader("Content-type", "application/x-www-form-urlencoded");
	console.log($('textarea').first().val());
	xhttp.send('data=' + $('textarea').first().val());	
};


