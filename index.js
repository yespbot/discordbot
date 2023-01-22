function setCookie(key, value) {
  var expires = new Date();
  // 30 Minutes avant deconnection automatique
  expires.setTime(expires.getTime() + 1000 * 60 * 30);
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}

async function onLogin() {
  const username = document.getElementById('username').value;
  const password = document.getElementById('password').value;

  console.log('fetching...');
  let res = await fetch('https://yespbot.fly.dev/login', {
    method: 'POST',
    body: new URLSearchParams({
      username: username,
      password: password
    })
  });

  res = await res.json();

  if (res.session) {
    setCookie('username', username);
    setCookie('password', password);
    window.location.href = './filter/index.html';
  } else {
    alert("Mauvais mot de passe / nom d'utilisateur ");
  }
  console.log(username, password);
}
