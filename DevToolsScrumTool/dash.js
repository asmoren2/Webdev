(function() {

    // Initialize Firebase
    /*var config = {
        apiKey: "AIzaSyDTYxOvNttW9scHzpTN2bWe2S0oQ86iap8",
        authDomain: "devtools-73ed5.firebaseapp.com",
        databaseURL: "https://devtools-73ed5.firebaseio.com",
        storageBucket: "devtools-73ed5.appspot.com",
        messagingSenderId: "146302750750"
    };*/
    //firebase.initializeApp(config);

    const btnLogOut = document.getElementById('btnLogOut');
    const btnDashboard = document.getElementById('btnDashboard');
    const btnProfile = document.getElementById('btnProfile');
    const btnSprint = document.getElementById('btnSprint');
    const btnAddProject = document.getElementById('newProject');
    const btnCancel = document.getElementById('btnCancel');
    const btnSubmit = document.getElementById('btnSubmit');
    const btnProjLink = document.getElementById('projectLink');
    const txtPName= document.getElementById('txtPName');
    const txtPUsers= document.getElementById('txtPUsers');
    const txtPDescription= document.getElementById('txtPDescription');
    const txtPDuration= document.getElementById('txtPDuration');
    const txtPNumbSprints= document.getElementById('txtPNumbSprints');
    const txtProjectID= document.getElementById('projID');
    $('#AddProject').hide();
    var uid, userEmail;
    var poRef;
    var role='';

    btnAddProject.addEventListener('click', e =>{
        $('#AddProject').show();
        $('#dashView').hide();
    });

    btnCancel.addEventListener('click', e =>{
        $('#AddProject').hide();
        $('#dashView').show();
    });

    btnLogOut.addEventListener('click', e =>{
    	firebase.auth().signOut();
    	window.open('index.html','_self',false);
    });

    btnDashboard.addEventListener('click', e =>{
        window.open('dashboard.html','_self',false);
    });

    btnProfile.addEventListener('click', e =>{
        window.open('profile.html','_self',false);
    });



    // Add a realtime login listner
    firebase.auth().onAuthStateChanged(firebaseUser => {
        if(firebaseUser){
           uid= firebaseUser.uid;
           userEmail= firebaseUser.email;
           //console.log(userEmail);
           $('#navigationTitle').append(userEmail);

           poCheck();
           getProjects();
           getTasks();


        }else{
            window.open('index.html','_self',false);
            //console.log('user not found');
        }

    });


    //Checks if the user is Product Owner else hide tha ability to start new project
    function poCheck(){
    	poRef = firebase.database().ref('Users/'+uid);
           poRef.on('value', function(data) {
           		role=data.val().Role;
        		roleFinder(role);
    	});
    }

    function roleFinder(role)
    {
    	var comp= 'Product Owner';
    	////console.log(role);
        try{
           	if(role.localeCompare(comp)!=0){
           		$('#newProject').hide();
           	}
        }
        catch(err)
        {
            console.log(err);
        }
    }

    function getProjects(){
    	var projRef = firebase.database().ref('AllProjects/');
    	projRef.on('child_added', function(data) {
        	getProjectsHelper(data.val().Email, data.val().projID);
        });
    }

    function getProjectsHelper(email, id){
        try{
        	if(email.localeCompare(userEmail)==0)
        	{
                //console.log('here');
        		var currProjRef = firebase.database().ref('Projects/'+id);
        		currProjRef.on('value', function(data) {
            		addProjectHTML(data.val().projectName, data.val().projectID);
            	});
        	}
        }catch(err)
        {
            console.log(err);
        }
    }

    function addProjectHTML(name, id){
        try{
    	var row= "<tr>\
                    <th class=\"mdl-data-table__cell--non-numeric\">"+name+"</th>\
      				<th class=\"mdl-data-table__cell--non-numeric\"><button class=\"mdl-button mdl-js-button mdl-button--accent\" id=\"projectLink\">Link</button></th>\
                    <input type=\"hidden\" name=\"projID\" class=\"projID\" value="+id+">\
    			</tr>";
    	$('#projectData').append(row);
        }
        catch(error)
        {
            console.log(error);
        }
    }

    $(document).on('click', '#projectLink', function(){
        var sendProjID= $('input[type=hidden]', $(this).closest("tr")).val();

        if (typeof(Storage) !== "undefined") {
            // Store
            localStorage.setItem("pID", sendProjID);
        } else {
            document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
        }
        window.open('project.html','_self',false);

    });


    function getTasks(){
        var taskRef = firebase.database().ref('Tasks/');
        //console.log('here111');
        taskRef.on('child_added', function(data) {
            try{
                if(data.val().taskAssigned.localeCompare(userEmail)==0)
                {
                    //console.log('here222'+data.val().taskID);
                    var x= parseInt(data.val().taskDuration) - parseInt(data.val().taskCompleted);
                    addTaskHTML(data.val().taskName, x, data.val().taskID, data.val().taskStatus);   
                }
            }catch(err)
            {
                console.log(err);
            }
        });
    }
            
    function addTaskHTML(name, time, id, status){
        ////console.log(name+" "+ time);
       try{ 
            if(status.localeCompare("BackLog")==0)
            {
                var row= "<tr id="+id+" draggable=\"true\" ondragstart=\"BLdrag(event)\">\
                        <th class=\"mdl-data-table__cell--non-numeric\">"+name+"</th>\
                        <th class=\"mdl-data-table__cell--non-numeric\"><button class=\"mdl-button mdl-js-button mdl-button--accent\" id=\"taskLink\">Link</button></th>\
                        <th class=\"mdl-data-table__cell--non-numeric\" id=\"timeID\">"+time+"</th>\
                        <input type=\"hidden\" name=\"taskID\" class=\"taskID\" value="+id+">\
                    </tr>";
                $('#BLData').append(row);
            } else if (status.localeCompare("OnGoing")==0)
            {
                var row= "<tr id="+id+" draggable=\"true\" ondragstart=\"OGdrag(event)\">\
                        <th class=\"mdl-data-table__cell--non-numeric\">"+name+"</th>\
                        <th class=\"mdl-data-table__cell--non-numeric\"><button class=\"mdl-button mdl-js-button mdl-button--accent\" id=\"taskLink\">Link</button></th>\
                        <th class=\"mdl-data-table__cell--non-numeric\" id=\"timeID\">"+time+"</th>\
                        <input type=\"hidden\" name=\"taskID\" class=\"taskID\" value="+id+">\
                    </tr>";
                $('#OGData').append(row);
            }
            else if(status.localeCompare("Done")==0)
            {
                var row= "<tr id="+id+">\
                        <th class=\"mdl-data-table__cell--non-numeric\">"+name+"</th>\
                        <th class=\"mdl-data-table__cell--non-numeric\"><button class=\"mdl-button mdl-js-button mdl-button--accent\" id=\"taskLink\">Link</button></th>\
                        <th class=\"mdl-data-table__cell--non-numeric\" id=\"timeID\">"+time+"</th>\
                        <input type=\"hidden\" name=\"taskID\" class=\"taskID\" value="+id+">\
                    </tr>";
                $('#DData').append(row);
            }
        }catch(err)
        {
            console.log(err)
        }
    }

    $(document).on('click', '#taskLink', function(){
        var sendTaskID= $('input[type=hidden]', $(this).closest("tr")).val();

        if (typeof(Storage) !== "undefined") {
            // Store
            localStorage.setItem("tID", sendTaskID);
        } else {
            document.getElementById("result").innerHTML = "Sorry, your browser does not support Web Storage...";
        }
        window.open('task.html','_self',false);
        
    });

    function xxx()
    {
        //console.log("hereeeeeeee")
    }


	btnSubmit.addEventListener('click', e => {

        const projName= txtPName.value;
        const projUsers= txtPUsers.value;
        const projDescription= txtPDescription.value;
        const projDuration= txtPDuration.value;
        const projNumSprints= txtPNumbSprints.value;

        if(projName == null && projUsers == null && projDescription == null && projDuration== null && projNumSprints== null)
        {
            var snackbarContainer = document.querySelector('#demo-toast-example');
            var data = {message: 'Missing Fields'};
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        }
        else
        {
        	var seperateUsers= projUsers.split(',');

            // Get a key for a new Post.
        	var projID = firebase.database().ref().child('Projects').push().key;

			for (var i = 0; i < seperateUsers.length; i++) {
				seperateUsers[i]= seperateUsers[i].replace(/\s/g, '');
        		reportAllUsers(seperateUsers[i], projID);
        	}

            var postData = {
            	projectID: projID,
                projectName: projName,
                projUsers: projUsers,
                projDescription: projDescription,
                projDuration: projDuration,
                projNumSprints: projNumSprints,
            };

            // Write the new post's data simultaneously in the posts list and the user's post list.
            var updates = {};
            updates['/Projects/' + projID] = postData;

            firebase.database().ref().update(updates);

            $('#AddProject').hide();
            $('#dashView').show();
            txtPName.value = "";
            txtPUsers.value ="";
            txtPDescription.value = "";
            txtPDuration.value = "";
            txtPNumbSprints.value = "";
            var snackbarContainer = document.querySelector('#demo-toast-example');
            var data = {message: 'Project Created :)'};
            snackbarContainer.MaterialSnackbar.showSnackbar(data);
        }

    });

    function reportAllUsers(email, id)
    {
    	var newPostKey = firebase.database().ref().child('posts').push().key;
    	var postData = {
            projID: id,
            Email: email
        };

        // Write the new post's data simultaneously in the posts list and the user's post list.
        var updates = {};
        updates['/AllProjects/' + newPostKey] = postData;
        firebase.database().ref().update(updates);
    }

}());
