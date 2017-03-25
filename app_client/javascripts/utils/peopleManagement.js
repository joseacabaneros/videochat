function PeopleManagement(ws, growl) {
    var people = {};
    people.loading = [true];
    people.list = [];
    var user;

    this.addPerson = function (data) {
        people.list.push(data);
        if (user.userName != data.userName) {
            growl.info('User connected: ' + data.name, {
                title: 'Info',
            });
        }
    };

    this.getPeople = function () {
        return people.list;
    };

    this.deletePerson = function (data) {
        for (var i = 0; i < people.list.length; i++) {
            if (people.list[i].userName == data.userName) {
                growl.info('User disconnected: ' + data.name, {
                    title: 'Info',
                });
                people.list.splice(i, 1);
                i--;
            }
        }
    };

    this.setLoading = function (progress) {
        people.loading[0] = progress;
    };

    this.isLoading = function () {
        return people.loading;
    };

    this.setConnected = function (userName, name, surname, email, state) {
        user = { //local user
            'userName': userName,
            'name': name,
            'surname': surname,
            'email' : email,
            'state' : state
        };
        this.addPerson(user);
        sendData(userName, name, surname, email, state, 'connected');
    };

    this.setDisconnected = function () {
        this.deletePerson(user);
        sendData(user.userName, user.name, user.surname, user.email,
            user.state, 'disconnected');
    };

    function sendData(userName, name, surname, email, state, operation) {
        ws.send(JSON.stringify({
            'section': 'people',
            'data': {
                'operation': operation,
                'userName': userName,
                'name': name,
                'surname': surname,
                'email' : email,
                'state' : state}
        }));
    }
}