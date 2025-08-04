function initVkBridgeApp() {
    vkBridge.send('VKWebAppInit', {});
}

function friendsInvite() {
    vkBridge
        .send('VKWebAppGetFriends')
        .then((data) => {
            if (data) {
                // Данные о пользователях
                alert(data.users);
                console.log(data.users);
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
}

function setupApp(appDataCallback) {
    vkBridge
        .send('VKWebAppGetLaunchParams')
        .then((data) => {
            if (data.vk_user_id) {
                userInfo(data.vk_user_id, function (authData) {
                    appDataCallback(authData);
                });
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
}

function userInfo(userId, authCallback) {
    vkBridge
        .send('VKWebAppGetUserInfo', {
            user_id: userId,
        })
        .then((data) => {
            if (data.id) {
                // Данные пользователя получены
                authCallback(data);
            }
        })
        .catch((error) => {
            // Ошибка
            console.log(error);
        });
}
