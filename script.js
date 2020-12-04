const DATA_URL = 'https://cors-anywhere.herokuapp.com/https://maimai.sega.com/data/DXsongs.json'; //'./DXsongs.json';
const IMG_URL = 'https://maimai.sega.com/storage/DX_jacket/';
const IMG_URL_FALLBACK = 'https://maimai.sega.jp/storage/DX_jacket/';
const CATS = {
	'POPSアニメ': 'Pops & Anime',
	'niconicoボーカロイド': 'Niconico & Vocaloid',
	'東方Project': '東方Project',
	'ゲームバラエティ': 'Game & Variety',
	'maimai': 'Maimai',
	'オンゲキCHUNITHM': 'Ongeki & Chunithm',
};
const LVL_NAMES = {
	'bas': 'Basic',
	'adv': 'Advanced',
	'exp': 'Expert',
	'mas': 'Master',
	'remas': 'Re:Master',
};
const LVLS = Object.keys(LVL_NAMES);

const main = document.querySelector('main');
let compact_toggle = document.getElementById('compact');
let top_button = document.getElementById('top');
let search_field = document.getElementById('search');
let category_checkboxes = document.querySelectorAll('input[name="category"]');
let level_checkboxes = document.querySelectorAll('input[name="level"]');

let list = [];

const registerSW = async () => {
	if ('serviceWorker' in navigator) {
		try {
			await navigator.serviceWorker.register('./serviceworker.js');
		} catch (e) {
			console.error('Failed to register service worker', e);
		}
	}
};

const filter_songs = async () => {
	const query = search_field.value;
	const categories = Array.from(category_checkboxes).reduce((all, box) => box.checked ? [...all, box.value] : all, []);
	const levels = Array.from(level_checkboxes).reduce((all, box) => box.checked ? [...all, box.value] : all, []);

	for (let i = 0; i < list.length; i++) {
		const s = list[i];
		let showQuery = false;
		let showCategory = false;
		let showLevel = false;

		// Search query
		if (query !== '') {
			if (
				s.title.toLowerCase().includes(query.toLowerCase()) ||
				s.artist.toLowerCase().includes(query.toLowerCase()) ||
				s.title_romaji.includes(query.toLowerCase())
			) {
				showQuery = true;
			}
		} else {
			showQuery = true;
		}

		// Categories
		if (categories.length !== 0) {
			if (categories.includes(CATS[s.catcode]) || (categories.includes('New Music') && s.hasOwnProperty('date') && s.date === 'NEW')) {
				showCategory = true;
			}
		} else {
			showCategory = true;
		}

		// Levels
		if (levels.length !== 0) {
			if (
				levels.includes(s.lev_bas) ||
				levels.includes(s.lev_adv) ||
				levels.includes(s.lev_exp) ||
				levels.includes(s.lev_mas) ||
				levels.includes(s.lev_remas) ||
				levels.includes(s.dx_lev_bas) ||
				levels.includes(s.dx_lev_adv) ||
				levels.includes(s.dx_lev_exp) ||
				levels.includes(s.dx_lev_mas) ||
				levels.includes(s.dx_lev_remas)
			) {
				showLevel = true;
			}
		} else {
			showLevel = true;
		}

		let show = showQuery && showCategory && showLevel;
		s.el.classList.toggle('hidden', !show);
	}
};

const render_songs = async data => {
	main.innerHTML = '';
	let fragment = new DocumentFragment();

	let observer;
	if ("IntersectionObserver" in window) {
		observer = new IntersectionObserver((entries, observer) => {
			entries.forEach(entry => {
				if (entry.isIntersecting) {
					entry.target.src = entry.target.dataset.src;
					observer.unobserve(entry.target);
				}
			});
		});
	}

	for (let i = 0; i < data.length; i++) {
		const s = data[i];
		let song = document.createElement('div');
		song.className = 'song';
		song.dataset.cat = CATS[s.catcode];
		song.title = CATS[s.catcode];
		if (s.hasOwnProperty('date') && s.date === 'NEW') {
			song.dataset.new = true;
		}
		if (s.hasOwnProperty('key')) {
			song.dataset.locked = true;
		}

		let img = document.createElement('img');
		img.alt = '';
		img.title = s.title;
		if ("IntersectionObserver" in window && observer) {
			img.dataset.src = `${IMG_URL}${s.image_url}`;
			img.src = "data:image/svg+xml,%3Csvg viewBox='0 0 100 100' xmlns='http://www.w3.org/2000/svg'%3E%3Cstyle%3E .e %7B font-size: 20px; %7D %3C/style%3E%3Ctext x='40' y='55' class='e'%3E⌛%3C/text%3E%3C/svg%3E";
			observer.observe(img);
		} else {
			img.src = `${IMG_URL}${s.image_url}`;
		}
		img.onerror = (event) => {
			img.onerror = (event) => { img.onerror = null; img.src = "でらっくま.png" };
			img.src = `${IMG_URL_FALLBACK}${s.image_url}`;
		};
		song.appendChild(img);

		let meta = document.createElement('div');
		meta.className = 'meta';
		let title = document.createElement('span');
		title.className = 'title';
		title.appendChild(document.createTextNode(s.title));
		meta.appendChild(title);

		let artist = document.createElement('span');
		artist.className = 'artist';
		artist.appendChild(document.createTextNode(s.artist));
		meta.appendChild(artist);

		let levels = document.createElement('div');
		levels.className = 'levels';
		if (s.hasOwnProperty(`lev_${LVLS[0]}`)) {
			// FiNALE levels
			let fn = document.createElement('div');
			fn.className = 'fn';
			LVLS.forEach(lvl => {
				let level = document.createElement('span');
				level.className = lvl;
				level.title = LVL_NAMES[lvl];
				if (s.hasOwnProperty(`lev_${lvl}`)) {
					level.appendChild(document.createTextNode(s[`lev_${lvl}`]));
				}
				fn.appendChild(level);
			});
			levels.appendChild(fn);
		}
		if (s.hasOwnProperty(`dx_lev_${LVLS[0]}`)) {
			// DX levels
			let dx = document.createElement('div');
			dx.className = 'dx';
			LVLS.forEach(lvl => {
				let level = document.createElement('span');
				level.className = lvl;
				level.title = LVL_NAMES[lvl];
				if (s.hasOwnProperty(`dx_lev_${lvl}`)) {
					level.appendChild(document.createTextNode(s[`dx_lev_${lvl}`]));
				}
				dx.appendChild(level);
			});
			levels.appendChild(dx);
		}
		meta.appendChild(levels);

		song.appendChild(meta);

		fragment.appendChild(song);
		list.push({
			el: song,
			...s,
		});
	}

	main.appendChild(fragment);
};

const fetch_data = async () => {
	try {
		console.log('Loading...');
		let res = await fetch(DATA_URL);
		let data = await res.json();
		console.log('Sorting songs...');
		data.sort((a,b) => a.sort - b.sort);
		data = data.map(song => ({
			...song,
			title_romaji: wanakana.toRomaji(song.title_kana),
		 }));
		console.log('Data loaded');
		render_songs(data);
	} catch(e) {
		console.error(e);
	}
};

fetch_data();

compact_toggle.addEventListener('change', async () => document.body.classList.toggle('compact', compact_toggle.checked));

top_button.addEventListener('click', () => window.scrollTo({ top: 0, behavior: 'smooth' }));

search_field.addEventListener('input', () => filter_songs());

category_checkboxes.forEach(box => {
	box.addEventListener('change', () => filter_songs());
});
level_checkboxes.forEach(box => {
	box.addEventListener('change', () => filter_songs());
});

document.addEventListener('scroll', () => top_button.classList.toggle('show', window.scrollY > 300));

window.addEventListener('load', () => registerSW());
