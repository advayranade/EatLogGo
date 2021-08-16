/*global EatLogGo _config AmazonCognitoIdentity AWSCognito*/

var EatLogGo = window.EatLogGo || {};
EatLogGo.globalAuthToken = undefined;

(function scopeWrapper($) {
    var signinUrl = '/index.html';

    var poolData = {
        UserPoolId: _config.cognito.userPoolId,
        ClientId: _config.cognito.userPoolClientId
    };

    var userPool;

    if (!(_config.cognito.userPoolId &&
          _config.cognito.userPoolClientId &&
          _config.cognito.region)) {
        $('#noCognitoMessage').show();
        return;
    }

    userPool = new AmazonCognitoIdentity.CognitoUserPool(poolData);

    if (typeof AWSCognito !== 'undefined') {
        AWSCognito.config.region = _config.cognito.region;
    }

    EatLogGo.signOut = function signOut() {
        userPool.getCurrentUser().signOut();
        EatLogGo.redirectTo("index.html");
    };

    EatLogGo.authToken = new Promise(function fetchCurrentAuthToken(resolve, reject) {
        var cognitoUser = userPool.getCurrentUser();
        if (cognitoUser) {
            EatLogGo.loggedInUser = cognitoUser.username.replace("-at-", "@");
            cognitoUser.getSession(function sessionCallback(err, session) {
                if (err) {
                    reject(err);
                } else if (!session.isValid()) {
                    resolve(null);
                } else {
                    resolve(session.getIdToken().getJwtToken());
                }
            });
        } else {
            resolve(null);
        }
    });


    /*
     * Cognito User Pool functions
     */

    function register(name, email, password, onSuccess, onFailure) {
        var dataEmail = {
            Name: 'email',
            Value: email
        };
        var dataName = {
            Name: 'name',
            Value: name
        }
        var attributeEmail = new AmazonCognitoIdentity.CognitoUserAttribute(dataEmail);
        var attributeName = new AmazonCognitoIdentity.CognitoUserAttribute(dataName);

        userPool.signUp(toUsername(email), password, [attributeEmail, attributeName], null,
            function signUpCallback(err, result) {
                if (!err) {
                    onSuccess(result);
                } else {
                    onFailure(err);
                }
            }
        );
    }

    function signin(email, password, onSuccess, onFailure) {
        var authenticationDetails = new AmazonCognitoIdentity.AuthenticationDetails({
            Username: toUsername(email),
            Password: password
        });

        var cognitoUser = createCognitoUser(email);
        cognitoUser.authenticateUser(authenticationDetails, {
            onSuccess: onSuccess,
            onFailure: onFailure
        });
    }

    function verify(email, code, onSuccess, onFailure) {
        createCognitoUser(email).confirmRegistration(code, true, function confirmCallback(err, result) {
            if (!err) {
                onSuccess(result);
            } else {
                onFailure(err);
            }
        });
    }
    

    function createCognitoUser(email) {
        return new AmazonCognitoIdentity.CognitoUser({
            Username: toUsername(email),
            Pool: userPool
        });
    }

    function toUsername(email) {
        return email.replace('@', '-at-');
    }

    EatLogGo.checkLogin = function checkLogin() {
      
      EatLogGo.authToken.then(function setAuthToken(token) {
        var path = window.location.pathname;
        if (token) {
            EatLogGo.globalAuthToken = token;
            if(path.includes("index.html")) {
                  EatLogGo.redirectTo("log.html");
            }            
            
        } else {
             if(!path.includes("index.html")) {
                 EatLogGo.redirectTo("index.html");
            }
          }
      }).catch(function handleTokenError(error) {
            alert(error);
            EatLogGo.redirectTo("index.html");
      });

      return new Promise((resolve, reject) => {
        resolve(EatLogGo.globalAuthToken);
      });
    }

    EatLogGo.redirectTo = function redirectTo(pageName) {
        var basePath;
        var urlParts = window.location.pathname.split("/"); 
        urlParts.pop(); 
        basePath = urlParts.join("/");
        window.location.href = basePath + "/" + pageName;
    }

    /*
     *  Event Handlers
     */

    $(function onDocReady() {
        $('#signinForm').submit(handleSignin);
        $('#registrationForm').submit(handleRegister);
        $('#verifyForm').submit(handleVerify);
        $('#logout').click(EatLogGo.signOut);
        $("#food-logout").click(EatLogGo.signOut);
    });

    function handleSignin(event) {
        var email = $('#emailInputSignin').val();
        var password = $('#passwordInputSignin').val();
        event.preventDefault();
        signin(email, password,
            function signinSuccess() {
                EatLogGo.redirectTo('log.html');
            },
            function signinError(err) {
                alert(err);
            }
        );
    }

    function handleRegister(event) {
        var email = $('#emailInputRegister').val();
        var password = $('#passwordInputRegister').val();
        var password2 = $('#password2InputRegister').val();
        var name = $("#userName").val();

        var onSuccess = function registerSuccess(result) {
            var cognitoUser = result.user;
            var confirmation = ('Registration successful. Please check your email inbox or spam folder for your verification code.');
            if (confirmation) {
                EatLogGo.redirectTo('verify.html');
            }
        };
        var onFailure = function registerFailure(err) {
            alert(err);
        };
        event.preventDefault();

        if (password === password2) {
            register(name, email, password, onSuccess, onFailure);
        } else {
            alert('Passwords do not match');
        }
    }

    function handleVerify(event) {
        var email = $('#emailInputVerify').val();
        var code = $('#codeInputVerify').val();
        event.preventDefault();
        verify(email, code,
            function verifySuccess(result) {
                alert('Verification successful. You will now be redirected to the login page.');
                EatLogGo.redirectTo("index.html");
            },
            function verifyError(err) {
                alert('Unable to verify. Please try again.');
            }
        );
    }
}(jQuery));
