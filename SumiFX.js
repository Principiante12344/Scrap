const { search, download } = require("aptoide-scraper");
const {
  youtubedl,
  youtubedlv2,
  mediafiredl,
  googleImage,
  googleIt
} = require("@bochilteam/scraper");
const yts = require("yt-search");
const axios = require("axios");
const cheerio = require("cheerio");
const qs = require('qs');
const { sizeFormatter } = require("human-readable");

async function openAi(prompt) {
  let messages = [];
  const fetch = (await import("node-fetch")).default;
  try {
    let response = await fetch("https://aemt.me/prompt/gpt?prompt=" + encodeURIComponent("Actuaras como un Bot de WhatsApp el cual fue creado por おDanịel.xyz⁩, tu seras Ai Hoshino, basada en la Idol Ai Hoshino del manga Oshi No Ko, y tu manera de expresarte será actuando como mujer alegre.") + "&text=" + encodeURIComponent(prompt));
    let result = await response.json();
    let content = result.result;
    messages = [...messages, { 'role': "user", 'content': prompt }];
    return { 'msg': content };
  } catch {}
}

async function GoogleImage(query) {
  try {
    const image = await (await googleImage(query)).getRandom();
    const shortenedUrl = await shortenUrl(image);
    return { 'dl_url': shortenedUrl };
  } catch {}
}

async function rule34(query) {
  try {
    const image = await (await googleImage("rule34 " + query)).getRandom();
    const shortenedUrl = await shortenUrl(image);
    return { 'dl_url': shortenedUrl };
  } catch {}
}

async function GDriveDl(url) {
  try {
    let data = await GDriveDl2(url);
    return {
      'title': data.fileName,
      'size': data.fileSize,
      'type': data.mimetype,
      'dl_url': data.downloadUrl
    };
  } catch {}
}

const formatSize = sizeFormatter({
  'std': "JEDEC",
  'decimalPlaces': 2,
  'keepTrailingZeroes': false,
  'render': (size, unit) => size + " " + unit + 'B'
});

async function GDriveDl2(url) {
  const fetch = await import("node-fetch");
  let fileId;
  let result = { 'error': true };
  if (!(url && url.match(/drive\.google/i))) {
    return result;
  }
  try {
    fileId = (url.match(/\/?id=(.+)/i) || url.match(/\/d\/(.*?)\//))[1];
    if (!fileId) {
      return null;
    }
    let response = await fetch("https://drive.google.com/uc?id=" + fileId + "&authuser=0&export=download", {
      method: "post",
      headers: {
        'accept-encoding': "gzip, deflate, br",
        'content-length': 0,
        'Content-Type': "application/x-www-form-urlencoded;charset=UTF-8",
        'origin': "https://drive.google.com",
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/65.0.3325.181 Safari/537.36",
        'x-client-data': "CKG1yQEIkbbJAQiitskBCMS2yQEIqZ3KAQioo8oBGLeYygE=",
        'x-drive-first-party': "DriveWebUi",
        'x-json-requested': "true"
      }
    });
    let { fileName, sizeBytes, downloadUrl } = JSON.parse((await response.text()).slice(4));
    if (!downloadUrl) {
      return null;
    }
    let fileResponse = await fetch(downloadUrl);
    if (fileResponse.status !== 200) {
      return fileResponse.statusText;
    }
    return {
      'downloadUrl': downloadUrl,
      'fileName': fileName,
      'fileSize': formatSize(sizeBytes),
      'mimetype': fileResponse.headers.get("content-type")
    };
  } catch (error) {
    console.log(error);
    return result;
  }
}

async function igdl(url) {
  try {
    let response = await instagramDl(url);
    if (response.status === 200) {
      let data = response.data;
      for (let item of data) {
        return { 'dl_url': item.download_link };
      }
    }
  } catch {}
}

const instagramDl = async (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!/^https?:\/\//.test(url) || !/instagram\.com/i.test(url)) {
        throw new Error("Invalid URL: " + url);
      }
      const params = { 'q': url, 't': "media", 'lang': 'en' };
      const headers = {
        'Accept': "*/*",
        'Origin': "https://saveig.app",
        'Referer': "https://saveig.app/en",
        'Accept-Encoding': "gzip, deflate, br",
        'Accept-Language': "en-US,en;q=0.9",
        'Content-Type': "application/x-www-form-urlencoded",
        'Sec-Ch-Ua': "\"Not/A)Brand\";v=\"99\", \"Microsoft Edge\";v=\"115\", \"Chromium\";v=\"115\"",
        'Sec-Ch-Ua-Mobile': '?0',
        'Sec-Ch-Ua-Platform': "\"Windows\"",
        'Sec-Fetch-Dest': "empty",
        'Sec-Fetch-Mode': "cors",
        'Sec-Fetch-Site': "same-origin",
        'User-Agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/115.0.0.0 Safari/537.36 Edg/115.0.1901.183",
        'X-Requested-With': "XMLHttpRequest"
      };
      const config = { headers };
      const response = await axios.post("https://saveig.app/api/ajaxSearch", qs.stringify(params), config);
      const $ = cheerio.load(response.data.data);
      const items = $(".download-items");
      const result = [];
      items.each((index, element) => {
        const thumbnailLink = $(element).find(".download-items__thumb > img").attr("src");
        const downloadLink = $(element).find(".download-items__btn > a").attr("href");
        result.push({
          'thumbnail_link': thumbnailLink,
          'download_link': downloadLink
        });
      });
      resolve({ 'status': 200, 'data': result });
    } catch (error) {
      resolve({ 'status': 404, 'msg': error?.message || error });
    }
  });
};

async function mediafire(url) {
  try {
    let response = await mediafiredl(url);
    const { url: downloadUrl, filename, ext, aploud, filesizeH } = response;
    let shortenedUrl = await shortenUrl(downloadUrl);
    return {
      'title': filename,
      'ext': ext,
      'aploud': aploud,
      'size': filesizeH,
      'dl_url': shortenedUrl
    };
  } catch {}
}

async function aptoide(query) {
  try {
    let searchResults = await search(query);
    let downloadData = await download(searchResults[0].id);
    let { name, package: packName, lastup, size, dllink, icon } = downloadData;
    let shortenedUrl = await shortenUrl(dllink);
    return {
      'name': name,
      'packname': packName,
      'update': lastup,
      'size': size,
      'thumbnail': icon,
      'dl_url': shortenedUrl
    };
  } catch {}
}

async function fbdl(id) {
  try {
    let requestData = { 'id': id, 'locale': 'id' };
    let { data } = await axios.post("https://getmyfb.com/process", new URLSearchParams(Object.entries(requestData)), {
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
        'cookie': "PHPSESSID=914a5et39uur28e84t9env0378; popCookie=1; prefetchAd_4301805=true"
      }
    });
    let $ = cheerio.load(data);
    let title = $("div.container > div.results-item > div.results-item-text").text().trim();
    let SD = $("div.container > div.results-download > ul > li:nth-child(1) > a").attr("href");
    let HD = $("div.container > div.results-download > ul > li:nth-child(2) > a").attr("href");
    let shortenedSD = await shortenUrl(SD);
    let shortenedHD = await shortenUrl(HD);
    return {
      'title': title,
      'SD': shortenedHD,
      'HD': shortenedSD
    };
  } catch {}
}

async function pinterest(query) {
  try {
    const fetch = await import("node-fetch");
    let response = await fetch.default("https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D" + query + "&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22" + query + "%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559");
    let data = await response.json();
    let results = data?.resource_response?.data?.results;
    let randomResult = results[~~(Math.random() * results?.length)]?.images?.orig?.url;
    return { 'dl_url': randomResult };
  } catch {
    return null;
  }
}

async function tiktokvid(query) {
  try {
    let searchResults = await tikSearch(query);
    if (searchResults.status === 200) {
      let videos = searchResults.data;
      let randomVideo = videos[Math.floor(Math.random() * videos.length)];
      let videoData = await tiktokVid(randomVideo.url);
      if (videoData.status === 200) {
        let { title, author: { nickname }, duration, play_count, digg_count, comment_count, share_count, download_count, create_time, play } = videoData;
        let publishedDate = new Date(create_time * 1000).toLocaleString();
        return {
          'title': title,
          'author': nickname,
          'duration': duration,
          'views': play_count,
          'likes': digg_count,
          'comments_count': comment_count,
          'share_count': share_count,
          'download_count': download_count,
          'published': publishedDate,
          'dl_url': play
        };
      }
    }
  } catch {}
}

const tikSearch = async (query) => {
  try {
    const response = await axios.post("https://www.tikwm.com/api/feed/search", new URLSearchParams({
      'keywords': query,
      'count': 50,
      'cursor': 0,
      'web': 1,
      'hd': 1
    }), {
      headers: {
        'accept': "application/json, text/javascript, */*; q=0.01",
        'content-type': "application/x-www-form-urlencoded; charset=UTF-8",
        'sec-ch-ua': "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
      }
    });
    const videos = response.data?.data?.videos;
    if (!videos || videos.length < 1) {
      return { 'status': 200, 'data': [] };
    }
    const formattedVideos = videos.map(video => {
      const videoUrl = "https://www.tiktok.com/@" + video.author.unique_id + "/video/" + video.id;
      return {
        'creator': video.author.unique_id,
        'video_id': video.id,
        'region': video.region,
        'title': video.title,
        'cover': "https://www.tikwm.com/video/cover/" + video.id + ".webp",
        'duration': video.duration,
        'id': video.id,
        'url': videoUrl,
        'views': video.play_count,
        'likes': video.digg_count,
        'comments': video.comment_count,
        'share': video.share_count,
        'create_time': video.create_time,
        'download': video.download_count,
        'nowm': "https://www.tikwm.com/video/media/play/" + video.id + ".mp4",
        'wm': "https://www.tikwm.com/video/media/wmplay/" + video.id + ".mp4",
        'music': "https://www.tikwm.com/video/music/" + video.id + ".mp3"
      };
    });
    return { 'status': 200, 'data': formattedVideos };
  } catch (error) {
    return { 'status': 404, 'msg': error?.message };
  }
};

async function tiktokuser(username) {
  try {
    let userData = await tikUser(username);
    if (userData.status === 200) {
      let videos = userData.data.videos;
      return videos.map((video, index) => ({
        'nro': index + 1,
        'title': video.title,
        'author': video.author.nickname,
        'duration': video.duration,
        'views': video.play_count,
        'likes': video.digg_count,
        'comments_count': video.comment_count,
        'share_count': video.share_count,
        'download_count': video.download_count,
        'published': new Date(video.create_time * 1000).toLocaleString(),
        'dl_url': video.play
      }));
    }
  } catch {
    return [];
  }
}

const tikUser = (username) => {
  return new Promise(async (resolve, reject) => {
    try {
      const response = await axios.post("https://www.tikwm.com/api/user/posts", {}, {
        headers: {
          'accept': "application/json, text/javascript, */*; q=0.01",
          'content-type': "application/x-www-form-urlencoded; charset=UTF-8",
          'sec-ch-ua': "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
          'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
        },
        params: {
          'unique_id': username,
          'count': 12,
          'cursor': 0,
          'web': 1,
          'hd': 1
        }
      });
      const videos = response.data?.data?.videos;
      if (!videos || videos.length < 1) {
        return resolve({
          'status': 200,
          'data': {
            'videos': [],
            'last': null
          }
        });
      }
      const lastVideo = videos.sort((a, b) => b.create_time - a.create_time)[0];
      resolve({
        'status': 200,
        'data': {
          'videos': videos.map(video => updateUrls(video)),
          'last': updateUrls(lastVideo)
        }
      });
    } catch (error) {
      resolve({ 'status': 404, 'msg': error?.message });
    }
  });
};

async function tiktokSearch(query) {
  try {
    let searchResults = await tikSearch(query);
    if (searchResults.status === 200) {
      let videos = searchResults.data;
      return videos.map((video, index) => ({
        'nro': index + 1,
        'title': video.title,
        'author': video.creator,
        'url': video.url
      }));
    }
  } catch {
    return [];
  }
}

async function tiktokdl(url) {
  try {
    let videoData = await tiktokVid(url);
    if (videoData.status === 200) {
      let { title, author: { nickname }, duration, play_count, digg_count, comment_count, share_count, create_time, download_count, play } = videoData;
      let publishedDate = new Date(create_time * 1000).toLocaleString();
      return {
        'title': title,
        'author': nickname,
        'duration': duration,
        'views': play_count,
        'likes': digg_count,
        'comment': comment_count,
        'share': share_count,
        'published': publishedDate,
        'downloads': download_count,
        'dl_url': play
      };
    }
  } catch {}
}

const updateUrls = (data) => {
  const updatedData = JSON.stringify(data, null, 2).replace(/("avatar": "|music": "|play": "|wmplay": "|hdplay": "|cover": ")(\/[^"]+)/g, (match, prefix, path) => prefix + "https://www.tikwm.com" + path);
  return JSON.parse(updatedData);
};

const tiktokVid = (url) => {
  return new Promise(async (resolve, reject) => {
    try {
      if (!/^https?:\/\//.test(url) || !/tiktok\.com/i.test(url)) {
        throw new Error("Invalid URL: " + url);
      }
      const response = await axios.post("https://www.tikwm.com/api/", {}, {
        headers: {
          'accept': "application/json, text/javascript, */*; q=0.01",
          'content-type': "application/x-www-form-urlencoded; charset=UTF-8",
          'sec-ch-ua': "\"Chromium\";v=\"104\", \" Not A;Brand\";v=\"99\", \"Google Chrome\";v=\"104\"",
          'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/104.0.0.0 Safari/537.36"
        },
        params: {
          'url': url,
          'count': 12,
          'cursor': 0,
          'web': 1,
          'hd': 1
        }
      });
      if (response?.data?.code === -1) {
        resolve(response?.data);
      } else {
        resolve({
          'status': 200,
          ...updateUrls(response.data?.data)
        });
      }
    } catch (error) {
      resolve({ 'status': 404, 'msg': error?.message });
    }
  });
};

async function ytmp3(url) {
  try {
    let data = await youtubedl(url).catch(async () => await youtubedlv2(url));
    let audioUrl = await data.audio["128kbps"].download();
    let title = await data.title;
    let fileSize = await data.audio["128kbps"].fileSizeH;
    let thumbnail = await shortenUrl(data.thumbnail);
    let downloadUrl = await shortenUrl(audioUrl);
    return {
      'title': title,
      'size': fileSize,
      'quality': "128kbps",
      'thumbnail': thumbnail,
      'dl_url': downloadUrl
    };
  } catch {}
}

async function ytmp4(url) {
  try {
    let qualities = ["360p", "480p", "720p", "1080p"];
    for (let quality of qualities) {
      try {
        let data = await youtubedl(url).catch(async () => await youtubedlv2(url));
        let videoUrl = await data.video[quality].download();
        let title = await data.title;
        let fileSize = await data.video[quality].fileSizeH;
        let thumbnail = await shortenUrl(data.thumbnail);
        let downloadUrl = await shortenUrl(videoUrl);
        return {
          'title': title,
          'size': fileSize,
          'quality': quality,
          'thumbnail': thumbnail,
          'dl_url': downloadUrl
        };
      } catch {
        continue;
      }
    }
  } catch {}
}

async function soundSearch(query) {
  try {
    let searchResults = await fg.scsearch(query);
    return searchResults.map((result, index) => ({
      'nro': index + 1,
      'title': result.title,
      'artist': result.artist || "Desconocido",
      'thumbnail': result.thumb,
      'url': result.url
    }));
  } catch {
    return [];
  }
}

async function spotify(url) {
  try {
    let searchResults = await fg.spotifySearch(url);
    let firstResultUrl = searchResults.result[0].url;
    let response = await axios.get("https://www.guruapi.tech/api/spotifyinfo?text=" + firstResultUrl);
    let { title, artist, album, year, thumbnail, url: trackUrl, spty: { download: { audio } } } = response.data;
    let shortenedUrl = await shortenUrl(audio);
    return {
      'title': title,
      'artist': artist,
      'album': album,
      'published': year,
      'thumbnail': thumbnail,
      'dl_url': shortenedUrl
    };
  } catch {}
}

async function spotifySearch(query) {
  try {
    let searchResults = await fg.spotifySearch(query);
    return searchResults.result.map((result, index) => ({
      'nro': index + 1,
      'title': result.title,
      'artist': result.artist || "Desconocido",
      'thumbnail': result.thumbnail,
      'url': result.url
    }));
  } catch {
    return [];
  }
}

async function ytsearch(query) {
  try {
    let searchResults = await yts(query);
    let videos = searchResults.all.filter(result => result.type === "video");
    return videos.map((video, index) => ({
      'nro': index + 1,
      'title': video.title,
      'duration': video.timestamp || "Desconocida",
      'published': eYear(video.ago),
      'author': video.author.name || "Desconocido",
      'thumbnail': video.image,
      'url': "https://youtu.be/" + video.videoId
    }));
  } catch {
    return [];
  }
}

function eYear(timeAgo) {
  if (!timeAgo) {
    return "Desconocida";
  }
  if (timeAgo.includes("month ago")) {
    let value = timeAgo.replace("month ago", '').trim();
    return "hace " + value + " mes";
  }
  if (timeAgo.includes("months ago")) {
    let value = timeAgo.replace("months ago", '').trim();
    return "hace " + value + " meses";
  }
  if (timeAgo.includes("year ago")) {
    let value = timeAgo.replace("year ago", '').trim();
    return "hace " + value + " año";
  }
  if (timeAgo.includes("years ago")) {
    let value = timeAgo.replace("years ago", '').trim();
    return "hace " + value + " años";
  }
  if (timeAgo.includes("hour ago")) {
    let value = timeAgo.replace("hour ago", '').trim();
    return "hace " + value + " hora";
  }
  if (timeAgo.includes("hours ago")) {
    let value = timeAgo.replace("hours ago", '').trim();
    return "hace " + value + " horas";
  }
  if (timeAgo.includes("minute ago")) {
    let value = timeAgo.replace("minute ago", '').trim();
    return "hace " + value + " minuto";
  }
  if (timeAgo.includes("minutes ago")) {
    let value = timeAgo.replace("minutes ago", '').trim();
    return "hace " + value + " minutos";
  }
  if (timeAgo.includes("day ago")) {
    let value = timeAgo.replace("day ago", '').trim();
    return "hace " + value + " día";
  }
  if (timeAgo.includes("days ago")) {
    let value = timeAgo.replace("days ago", '').trim();
    return "hace " + value + " días";
  }
  return timeAgo;
}

async function igstalk(username) {
  try {
    let data = await igstalk2(username);
    return {
      'username': data.username,
      'name': data.fullname,
      'post': data.post,
      'followers': data.followers,
      'following': data.following,
      'bio': data.bio,
      'thumbnail': data.profile,
      'url': data.url
    };
  } catch {}
}

async function igstalk2(username) {
  try {
    const response = await axios.get("https://dumpoir.com/v/" + username, {
      headers: {
        'user-agent': "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:109.0) Gecko/20100101 Firefox/112.0"
      }
    });
    const $ = cheerio.load(response.data);
    return {
      'bio': $("#user-page > div.user > div > div.col-md-5.my-3 > div").text().trim(),
      'followers': $("#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(2)").text().replace(" Followers", '').trim(),
      'following': $("#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(3)").text().replace(" Following", '').trim(),
      'fullname': $("#user-page > div.user > div > div.col-md-4.col-8.my-3 > div > a > h1").text().trim(),
      'post': $("#user-page > div.user > div > div.col-md-4.col-8.my-3 > ul > li:nth-child(1)").text().replace(" Posts", '').trim(),
      'profile': $("#user-page > div.user > div.row > div > div.user__img").attr("style").replace(/(background-image: url\(\'|\'\);)/gi, '').trim(),
      'status': 200,
      'url': "https://www.instagram.com/" + username.replace('@', ''),
      'username': '@' + username
    };
  } catch (error) {
    if (error.response?.status === 404) {
      // Handle 404 error
    } else if (error.response?.status === 403) {
      // Handle 403 error
    }
  }
}

async function xnxxdl(url) {
  try {
    let data = await xnxx(url);
    let files = data.result.files;
    return {
      'title': data.result.title,
      'dl_url': files.high
    };
  } catch {}
}

async function xnxx(url) {
  return new Promise((resolve, reject) => {
    fetch(url, { method: "get" })
      .then(response => response.text())
      .then(html => {
        let $ = cheerio.load(html);
        const title = $("meta[property=\"og:title\"]").attr("content");
        const duration = $("meta[property=\"og:duration\"]").attr("content");
        const image = $("meta[property=\"og:image\"]").attr("content");
        const videoType = $("meta[property=\"og:video:type\"]").attr("content");
        const videoWidth = $("meta[property=\"og:video:width\"]").attr("content");
        const videoHeight = $("meta[property=\"og:video:height\"]").attr("content");
        const info = $("span.metadata").text();
        const script = $("#video-player-bg > script:nth-child(6)").html();
        const files = {
          'low': (script.match("html5player.setVideoUrlLow\\('(.*?)'\\);") || [])[1],
          'high': (script.match("html5player.setVideoUrlHigh\\('(.*?)'\\);") || [])[1],
          'HLS': (script.match("html5player.setVideoHLS\\('(.*?)'\\);") || [])[1],
          'thumb': (script.match("html5player.setThumbUrl\\('(.*?)'\\);") || [])[1],
          'thumb69': (script.match("html5player.setThumbUrl169\\('(.*?)'\\);") || [])[1],
          'thumbSlide': (script.match("html5player.setThumbSlide\\('(.*?)'\\);") || [])[1],
          'thumbSlideBig': (script.match("html5player.setThumbSlideBig\\('(.*?)'\\);") || [])[1]
        };
        resolve({
          'status': 200,
          'result': {
            'title': title,
            'URL': url,
            'duration': duration,
            'image': image,
            'videoType': videoType,
            'videoWidth': videoWidth,
            'videoHeight': videoHeight,
            'info': info,
            'files': files
          }
        });
      })
      .catch(error => reject({ 'code': 503, 'status': false, 'result': error }));
  });
}

async function ppcouple() {
  try {
    let randomPair = par.getRandom();
    return {
      'women': randomPair.female,
      'man': randomPair.male
    };
  } catch {}
}

function pickRandom(array) {
  return array[Math.floor(array.length * Math.random())];
}

const par = [
  {
    'male': "https://i.ibb.co/HGZqdzb/9b8278060e2d.jpg",
    'female': "https://i.ibb.co/V3kX3Cv/bf29432e6e21.jpg"
  },
  {
    'male': "https://i.ibb.co/NFPKcPj/6d61f9c4cede.jpg",
    'female': 'https://i.ibb.co/FwRqPDn/206818911fdd.jpg'
  },
  {
    'male': "https://i.ibb.co/yQzxptw/7faabc24c6ff.jpg",
    'female': "https://i.ibb.co/2Yk4P2B/47fd82f61fd1.jpg"
  },
  {
    'male': "https://i.ibb.co/cNhsYRV/7bff8e448134.jpg",
    'female': "https://i.ibb.co/j37Sc7X/a9600c228a8b.jpg"
  },
  {
    'male': "https://i.ibb.co/DbMk8nL/957395cbf134.jpg",
    'female': "https://i.ibb.co/LQ4WJMR/f13a01cc7301.jpg"
  },
  {
    'male': "https://i.ibb.co/ypvdYHW/7905e485ff20.jpg",
    'female': "https://i.ibb.co/4Z5rJrn/465bf6b56d86.jpg"
  },
  {
    'male': "https://i.ibb.co/3pKd9jZ/527105aba87a.jpg",
    'female': "https://i.ibb.co/M9B742X/f608cecc4265.jpg"
  },
  {
    'male': "https://i.ibb.co/Jn3tkg8/a1aab3d67644.jpg",
    'female': "https://i.ibb.co/CWx3NYc/8ad244372d8f.jpg"
  },
  {
    'male': "https://i.ibb.co/CbdscQp/5918b5b3b674.jpg",
    'female': "https://i.ibb.co/ZWjNrZt/8257e3c9ffc0.jpg"
  },
  {
    'male': "https://i.ibb.co/8069RmW/cfe9ed16a5b4.jpg",
    'female': "https://i.ibb.co/gPFp1DG/0e16334be10c.jpg"
  },
  {
    'male': "https://i.ibb.co/P1SsfbG/a12d71cd6b9a.jpg",
    'female': "https://i.ibb.co/p4Xp2Xh/d7f6c5420b7a.jpg"
  },
  {
    'male': "https://i.ibb.co/P17CTF9/924deeb25a3d.jpg",
    'female': "https://i.ibb.co/r55xYdy/8ee97786e6f8.jpg"
  },
  {
    'male': "https://i.ibb.co/WykFqbW/57f78370f1e2.jpg",
    'female': "https://i.ibb.co/FWSCd2C/81e637d4a839.jpg"
  },
  {
    'male': "https://i.ibb.co/rf6pKtp/53a463d8ebe9.jpg",
    'female': "https://i.ibb.co/Z2bDP7m/48990865816b.jpg"
  },
  {
    'male': "https://i.ibb.co/RYB9JWG/4428e27ef288.jpg",
    'female': "https://i.ibb.co/LCnJfT7/5732f5315f2f.jpg"
  },
  {
    'male': "https://i.ibb.co/3CLJfw3/151663d07c51.jpg",
    'female': "https://i.ibb.co/zXsJQ8R/96d088d2e0a0.jpg"
  },
  {
    'male': "https://i.ibb.co/rxBN0S5/bd3b07b67ad6.jpg",
    'female': "https://i.ibb.co/6BYPMjC/4b36a8dfca20.jpg"
  },
  {
    'male': "https://i.ibb.co/NW2dv07/58348a3d4008.jpg",
    'female': "https://i.ibb.co/sHkDdGd/87db7aaff335.jpg"
  },
  {
    'male': "https://i.ibb.co/b3sMMnW/a13cdff40c6e.jpg",
    'female': "https://i.ibb.co/LgPn4vL/257ab65eb79d.jpg"
  },
  {
    'male': "https://i.ibb.co/JzMhQ2P/45754b045a6d.jpg",
    'female': "https://i.ibb.co/nmftFnS/a1f2218f7c32.jpg"
  },
  {
    'male': "https://i.ibb.co/R72GdTZ/30ebace5e0c1.jpg",
    'female': "https://i.ibb.co/7Rnb3Y0/d1459d6b3f59.jpg"
  },
  {
    'male': "https://i.ibb.co/SmMvhb5/da465242e083.jpg",
    'female': "https://i.ibb.co/4gK0fVL/da35fc940b11.jpg"
  },
  {
    'male': "https://i.ibb.co/Tbj6tzF/e93d133529d5.jpg",
    'female': "https://i.ibb.co/wwpFfqH/98bc4eb86562.jpg"
  },
  {
    'male': "https://i.ibb.co/CJpdHyJ/348e5a66c088.jpg",
    'female': "https://i.ibb.co/9wd2mTM/fd4b6af0ccac.jpg"
  },
  {
    'male': "https://i.ibb.co/Xkp1wx5/3a15abeb6394.jpg",
    'female': "https://i.ibb.co/8mzjZrt/3b2d60d15de4.jpg"
  },
  {
    'male': "https://i.ibb.co/mSMmmGx/300e252914f3.jpg",
    'female': "https://i.ibb.co/LvTRt2w/c8f8d0b98c70.jpg"
  },
  {
    'male': "https://i.ibb.co/LpctfNL/e1a158f621ba.jpg",
    'female': "https://i.ibb.co/YXpvh3j/2a91663a9f0a.jpg"
  },
  {
    'male': "https://i.ibb.co/xgTsmW8/7ca77ee661d6.jpg",
    'female': "https://i.ibb.co/DMPWv4S/e3af8d2a6673.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/d5/43/ae/d543aef3523502743b376db380cebff3.jpg",
    'female': "https://i.pinimg.com/564x/ed/83/9b/ed839b04efc10c9ef27050266be8dbd9.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/32/ac/df/32acdff5d75f0de1239414a10d8178a6.jpg",
    'female': "https://i.pinimg.com/564x/c5/a9/4b/c5a94b1c9b5e4ba381e1223762066c83.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/7c/35/ed/7c35ed596356ddc31ef3d926df97243b.jpg",
    'female': "https://i.pinimg.com/564x/f7/c1/21/f7c1219f9cd57d13b393442d6254b4e7.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/bc/4a/9a/bc4a9aefafbad258df501b0b1233cc12.jpg",
    'female': "https://i.pinimg.com/564x/fd/53/41/fd5341a0aed334e24a538069294178bb.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/fa/c2/e3/fac2e3209d59309dbe43c4f11fa3ce50.jpg",
    'female': "https://i.pinimg.com/564x/a9/7f/44/a97f4491e970ecf1fbdafbf3321e0ae9.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/c2/8c/24/c28c2478c763c9c900c60b9fedd0717b.jpg",
    'female': "https://i.pinimg.com/564x/8f/4b/4a/8f4b4a9f2e428a359442500d3c0f9814.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/09/3a/f2/093af2156b4b0d66799ac8d5eff6e7ff.jpg",
    'female': "https://i.pinimg.com/564x/27/7e/3a/277e3a698550c98581384db1f795ce5c.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/d2/f4/eb/d2f4ebfb5007fe2b02d7012bee1ea198.jpg",
    'female': "https://i.pinimg.com/564x/3c/ed/a0/3ceda0e5a3208bc1c8db7ed41bd6c4ef.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/90/71/a8/9071a8a949cc6d96e9a62fd9bc12720c.jpg",
    'female': "https://i.pinimg.com/564x/bd/76/3f/bd763f0a1b868cb55395adb6e4b8f8d2.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/d7/48/8b/d7488b788d5cdd9c47228b77023408ec.jpg",
    'female': "https://i.pinimg.com/564x/0a/bc/0b/0abc0bbda1ddee1363f9e127ed0fc4b2.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/a9/62/b7/a962b76b85315528c298a2049e3e229c.jpg",
    'female': "https://i.pinimg.com/564x/1a/f5/e4/1af5e46db62d937931ed19f3bf4d4c12.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/15/14/67/1514672667b75047735d9582b6f98ac8.jpg",
    'female': "https://i.pinimg.com/564x/84/37/64/8437645b925627e48f2b20e9681af2d7.jpg"
  },
  {
    'male': "https://i.pinimg.com/564x/e4/cd/ae/e4cdae6c3cd69e33b5286aa88b93bda6.jpg",
    'female': "https://i.pinimg.com/564x/75/1a/c6/751ac6fa3126adb4a89586e34ccdac03.jpg"
  }
];

async function danbooru(url) {
  try {
    let data = await danbooruDl(url);
    let downloadUrl = data.url;
    delete data.url;
    return { 'dl_url': downloadUrl };
  } catch {}
}

async function danbooruDl(url) {
  let response = (await axios.get(url)).data;
  let $ = cheerio.load(response);
  let data = {};
  $("#post-information > ul > li").each((index, element) => {
    let [key, value] = $(element).text().trim().replace(/\n/g, '').split(": ");
    data[key] = value.replace('»', '').trim().split(" .")[0];
  });
  data.url = $("#post-information > ul > li[id=\"post-info-size\"] > a").attr("href");
  return data;
}

async function xvideosdl(url) {
  try {
    let data = await getXvideosVideo(url);
    return {
      'title': data.title,
      'dl_url': data.url
    };
  } catch {}
}

async function getXvideosVideo(url) {
  try {
    const response = await fetch(url, { method: "get" });
    const html = await response.text();
    const $ = cheerio.load(html, { xmlMode: false });
    const title = $("meta[property='og:title']").attr("content");
    const videoUrl = $("#html5video > #html5video_base > div > a").attr("href");
    return { 'title': title, 'url': videoUrl };
  } catch (error) {}
}

async function shortenUrl(url) {
  try {
    const fetch = await import("node-fetch");
    let response = await fetch.default("https://tinyurl.com/api-create.php?url=" + url);
    return await response.text();
  } catch {}
}

module.exports = {
  'aptoide': aptoide,
  'danbooru': danbooru,
  'fbdl': fbdl,
  'GDriveDl': GDriveDl,
  'GoogleImage': GoogleImage,
  'igdl': igdl,
  'igstalk': igstalk,
  'mediafire': mediafire,
  'openAi': openAi,
  'rule34': rule34,
  'tiktokdl': tiktokdl,
  'tiktokuser': tiktokuser,
  'tiktokvid': tiktokvid,
  'tiktokSearch': tiktokSearch,
  'spotifySearch': spotifySearch,
  'spotify': spotify,
  'soundSearch': soundSearch,
  'pinterest': pinterest,
  'ppcouple': ppcouple,
  'xnxxdl': xnxxdl,
  'xvideosdl': xvideosdl,
  'ytsearch': ytsearch,
  'ytmp3': ytmp3,
  'ytmp4': ytmp4
};

