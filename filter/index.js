function setCookie(key, value) {
  var expires = new Date();
  expires.setTime(expires.getTime() + 1 * 24 * 60 * 60 * 1000);
  document.cookie = key + '=' + value + ';expires=' + expires.toUTCString();
}

function getCookie(key) {
  var keyValue = document.cookie.match('(^|;) ?' + key + '=([^;]*)(;|$)');
  return keyValue ? keyValue[2] : null;
}

document.getElementById('title').innerHTML =
  'Connecté en tant que "' + getCookie('username') + '"';

console.log('loading js file');
let CURRENTJSON = [];

async function save() {
  // Envoyer liste actuelle de filtres au serveur

  console.log('Saving...');
  let res = await fetch('https://yespbot.fly.dev/setFilters', {
    method: 'POST',
    body: new URLSearchParams({
      username: getCookie('username'),
      password: getCookie('password'),
      filterData: JSON.stringify(CURRENTJSON)
    })
  });

  res = await res.json();

  if (!res.session) {
    window.location.href = './../index.html';
    alert("Mauvais mot de passe / nom d'utilisateur ");
  }
}

async function onFilterAdd() {
  let filterName = document.getElementById('modal_filterName').value;
  let filter = document.getElementById('modal_filter').value;
  let channelID = document.getElementById('modal_channelID').value;

  document.getElementById('modal_channelID').value = '';
  document.getElementById('modal_filter').value = '';
  document.getElementById('modal_filterName').value = '';

  if (filterName.match(/[\w\-.]+/gm)[0] != filterName) {
    alert('Le nom de ton filtre est invalide');
    return;
  }

  // Update Current Json
  CURRENTJSON = await getJson();

  if (CURRENTJSON.filter((x) => x.titre == filterName).length == 1) {
    alert('Le nom de ce filtre est déjà pris');
    return;
  }

  filter = filter.split(';');

  filter = filter.map((x) => x.replace('www.vinted.fr', 'www.vinted.be'));

  CURRENTJSON.push({
    titre: filterName,
    liens: filter,
    channelDiscord: channelID
  });

  loadAllFilter(CURRENTJSON);
  save();
}

async function onFilterDelete(titre) {
  console.log(titre);

  CURRENTJSON = await getJson();
  console.log(CURRENTJSON);
  toRemoveProduct = CURRENTJSON.filter((x) => x.titre == titre);

  if (toRemoveProduct.length == 0) {
    alert('Ce produit à déja été supprimé par une autre personne');
    return;
  }

  //  delete le "name" sur le dom
  CURRENTJSON = CURRENTJSON.filter((x) => x.titre != titre);
  loadAllFilter();
  //  delete le "name" sur le serveur
  save();
}

function loadAllFilter() {
  /*
  JSON:
  [{
    filterName:"",
    filterLinks: [],
    "discordChannel":number
  }]
  */
  json = CURRENTJSON;
  let body = document.getElementById('filtresBody');
  // not always make this in this way:
  body.innerHTML = '';
  for (elem of json) {
    body.innerHTML +=
      `
    <div id="filtresBody">
        <div class="card"  id="filter_` +
      elem.titre +
      `"  style="width: 70%; margin-left: 15%; margin-bottom: 15px;">
          <div class="card-header">
            ` +
      elem.titre +
      `
            <button class="btn btn-danger" onclick="onFilterDelete('` +
      elem.titre +
      `')"  style="height: 30px; font-size: 10px; position: absolute; left: 82%; top: 18%;">Supprimer</button>
          </div>

        </div>`;
  }
}

async function getJson() {
  let res = await fetch('https://yespbot.fly.dev/getFilters', {
    method: 'POST',
    body: new URLSearchParams({
      username: getCookie('username'),
      password: getCookie('password')
    })
  });

  res = await res.json();
  if (!res.session) {
    window.location.href = './../index.html';
    return;
  }
  return res.filterData;
}

async function updaterLoop() {
  console.log('sleeping 10 minutes seconds before making new request');
  await new Promise((res) => setTimeout(() => res(), 1000 * 60 * 10));
  CURRENTJSON = await getJson();
  loadAllFilter();
  updaterLoop();
}

async function main() {
  CURRENTJSON = await getJson();
  loadAllFilter();
  updaterLoop();
}
main();
