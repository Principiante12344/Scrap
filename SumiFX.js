const { search, download } = require('aptoide-scraper')
const { youtubedl, youtubedlv2, mediafiredl } = require('@bochilteam/scraper')
const yts = require('yt-search')
const fg = require("api-dylux")
const axios = require('axios')
const cheerio = require('cheerio')
const request = require('request')

async function igdl(link) {
    try {
        const results = await fg.igdl(link)
          const url2 = results.result[0].url
          const dl_url = await shortenUrl(url2)
        return { dl_url }
    } catch {
  }
}

async function mediafire(link) {
    try {
        let res = await mediafiredl(link)
        let { url, filename, ext, aploud, filesizeH } = res
        let dl_url = await shortenUrl(url)
        let title = filename
        let size = filesizeH
        return { title, ext, aploud, size, dl_url }
    } catch (error) {
    }
}

async function appleMusic(text) {
    try {
        const { default: fetch } = await import('node-fetch')
        let api = await fetch(`https://delirius-api-oficial.vercel.app/api/applemusic?text=${text}`)
        let data = await api.json()

        let results = []
        if (data && data.length > 0) {
            for (let i = 0; i < (data.length <= 50 ? data.length : 50); i++) {
                let result = data[i];
                let formattedResult = {
                    nro: i + 1,
                    title: result.title,
                    artist: result.artists,
                    type: result.type,
                    url: result.url
                }
                results.push(formattedResult)
            }
        }

        return results
    } catch {
    }
}

async function aptoide(text) {
   try {
      let searchA = await search(text)
      let api = await download(searchA[0].id)
      let name = api.name
      let packname = api.package
      let update = api.lastup
      let size = api.size
      let url = api.dllink   
      let dl_url = await shortenUrl(url)
      let thumbnail = api.icon

        return { name, packname, update, size, dl_url, thumbnail }
    } catch {
    }
}

async function fbdl(url) {
    try {
        let config = {
            'id': url,
            'locale': 'id'
        }

        let { data } = await axios('https://getmyfb.com/process', {
            method: 'POST',
            data: new URLSearchParams(Object.entries(config)),
            headers: {
                "user-agent": "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/105.0.0.0 Safari/537.36",
                "cookie": "PHPSESSID=914a5et39uur28e84t9env0378; popCookie=1; prefetchAd_4301805=true"
            }
        })

        let $ = cheerio.load(data)
        let title = $('div.container > div.results-item > div.results-item-text').text().trim()
        let url1 = $('div.container > div.results-download > ul > li:nth-child(1) > a').attr('href');
        let url2 = $('div.container > div.results-download > ul > li:nth-child(2) > a').attr('href')
        let HD = await shortenUrl(url1)
        let SD = await shortenUrl(url2)

        return { title, SD, HD }
    } catch {
    }
}

async function openAi(text) {
      try {
        let previousMessages = []
          let anu = `Actuaras como un Bot de WhatsApp el cual fue creado por おDanịel.xyz⁩, tu seras Ai Hoshino, basada en la Idol Ai Hoshino del manga Oshi No Ko, y tu manera de expresarte será actuando como mujer alegre.`
          const fetch = await import('node-fetch')
             let response = await fetch(`https://aemt.me/prompt/gpt?prompt=${encodeURIComponent(anu)}&text=${encodeURIComponent(text)}`)
             let result = await response.json()
            let msg = result.result

           return { msg }
           
           previousMessages = [...previousMessages, { role: "user", content: text }]
          } catch {
        }
      }

async function pinterest(query) {
    try {
        const fetch = await import('node-fetch')
        let res = await fetch.default(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${query}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${query}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`)
        let json = await res.json()
        let data = json?.resource_response?.data?.results
        let dl_url = data[~~(Math.random() * (data?.length))]?.images?.orig?.url
        
        return { dl_url }
    } catch {
        return null
    }
}

async function tiktokDownloader(url) {
  try {
    let tiklydownAPI = `https://api.tiklydown.eu.org/api/download?url=${url}`
    let response = await axios.get(tiklydownAPI, {
      headers: {
        'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:122.0) Gecko/20100101 Firefox/122.0',
        'Accept': 'text/html,application/xhtml+xml,application/xml;q=0.9,image/avif,image/webp,*/*;q=0.8',
        'Accept-Language': 'id,en-US;q=0.7,en;q=0.3',
        'Accept-Encoding': 'gzip, deflate, br',
        'Connection': 'keep-alive',
        'Cookie': 'cf_clearance=IDhpJ2RO8UDI40tXLI4g45ZZGDiET0lnWy6bO.4oLqQ-1706368220-1-ASlDi8PXO3c7Jk/wNqrgxTj4gCrY4qr6QonEpMmvW1EKPYICk//uDMJ+wFCv2LXuv7t26eyFoSyVEGbdV8dV2gQ=',
        'Upgrade-Insecure-Requests': '1',
        'Sec-Fetch-Dest': 'document',
        'Sec-Fetch-Mode': 'navigate',
        'Sec-Fetch-Site': 'none',
        'Sec-Fetch-User': '?1',
        'If-None-Match': 'W/faa-OLjMXtR3QSf5fGpXMh35fxB63x0'
      }
    });
    return response.data
  } catch {
    return null
  }
}

async function tiktokdl(url) {
  try {
    let tiktokData = await tiktokDownloader(url)
    if (!tiktokData) return null

    let videoURL = tiktokData.video.noWatermark
    let title = tiktokData.title
    let published = tiktokData.created_at
    let quality = tiktokData.video.ratio
    let likes = tiktokData.stats.likeCount
    let commentCount = tiktokData.stats.commentCount
    let shareCount = tiktokData.stats.shareCount
    let views = tiktokData.stats.playCount
    let dl_url = await shortenUrl(videoURL)

    return { title, published, quality, likes, commentCount, shareCount, views, dl_url }
  } catch {
    return null
  }
}

async function tiktokSearch(text) {
    try {
      const { default: fetch } = await import('node-fetch')
        let api = await fetch(`https://api.yanzbotz.my.id/api/cari/tiktok?query=${text}`)
        let data = await api.json()

        let results = []
        let thumbnail = `https://i.ibb.co/kyTcqt9/file.jpg`
        if (data.status === 200 && data.result.videos && data.result.videos.length > 0) {
            for (let i = 0; i < (data.result.videos.length <= 50 ? data.result.videos.length : 50); i++) {
                let video = data.result.videos[i];
                let formattedResult = {
                    nro: i + 1,
                    title: video.title,
                    author: video.author.nickname,
                    url: `https://vm.tiktok.com/video/${video.video_id}`
                }
                results.push(formattedResult)
            }
        } else {
        }

        return { thumbnail, results }
    } catch {
    }
}

async function ytmp3(link) {
    try {
        let quality = '128kbps'
        let yt = await youtubedl(link).catch(async () => await youtubedlv2(link))
        let url = await yt.audio[quality].download()
        let title = await yt.title
        let size = await yt.audio[quality].fileSizeH
        let thum = yt.thumbnail
        let thumbnail = await shortenUrl(thum)
        let dl_url = await shortenUrl(url)

        return { title, size, quality, thumbnail, dl_url }
    } catch {
    }
}

async function ytmp4(link) {
    try {
        let quality = '360p'
        let yt = await youtubedl(link).catch(async () => await youtubedlv2(link))
        let url = await yt.video[quality].download()
        let title = await yt.title
        let size = await yt.video[quality].fileSizeH
        let thum = yt.thumbnail
        let thumbnail = await shortenUrl(thum)
        let dl_url = await shortenUrl(url)
        
        return { title, size, quality, thumbnail, dl_url }
    } catch {
    }
}

async function ytsearch(query) {
    try {
        let results = await yts(query)
        let videos = results.all.filter(v => v.type === "video")
        return videos.map((video, index) => ({
            nro: index + 1,
            title: video.title,
            duration: video.timestamp || 'Desconocida',
            published: formatPublishedTime(video.ago),
            author: video.author.name || 'Desconocido',
            thumbnail: video.image,
            url: 'https://youtu.be/' + video.videoId
        }))
    } catch (error) {
        return []
    }
}

function formatPublishedTime(time) {
    if (!time) return 'Desconocida'
    if (time.includes('month')) {
        return 'hace ' + time.replace("months ago", "").trim() + (time.includes('month ago') ? ' mes' : ' meses');
    } else if (time.includes('year')) {
        return 'hace ' + time.replace("years ago", "").trim() + (time.includes('year ago') ? ' año' : ' años');
    } else if (time.includes('hour')) {
        return 'hace ' + time.replace("hours ago", "").trim() + (time.includes('hour ago') ? ' hora' : ' horas');
    } else if (time.includes('minute')) {
        return 'hace ' + time.replace("minutes ago", "").trim() + (time.includes('minute ago') ? ' minuto' : ' minutos');
    } else if (time.includes('day')) {
        return 'hace ' + time.replace("days ago", "").trim() + (time.includes('day ago') ? ' día' : ' días');
    } else {
        return time
    }
}

async function soundcloud(url) { 
       try {
           let res = await soundcloudinfo(url)
             let title = res.judul
               let plays = res.download_count
             let thumbnail = res.thumb
           let link = res.link
             let dl_url = await shortenUrl(link)

            return { title, plays, thumbnail, thumbnail, dl_url }
       } catch {
    }
}

async function soundcloudinfo(link) {
    return new Promise((resolve, reject) => {
        const options = {
            method: 'POST',
            url: "https://www.klickaud.co/download.php",
            headers: {
                'content-type': 'application/x-www-form-urlencoded'
            },
            formData: {
                'value': link,
                '2311a6d881b099dc3820600739d52e64a1e6dcfe55097b5c7c649088c4e50c37': '710c08f2ba36bd969d1cbc68f59797421fcf90ca7cd398f78d67dfd8c3e554e3'
            }
        }

        request(options, async function (error, response, body) {
            if (error) throw new Error(error)
            const $ = cheerio.load(body)
            resolve({
                judul: $('#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(2)').text(),
                download_count: $('#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(3)').text(),
                thumb: $('#header > div > div > div.col-lg-8 > div > table > tbody > tr > td:nth-child(1) > img').attr('src'),
                link: $('#dlMP3').attr('onclick').split(`downloadFile('`)[1].split(`',`)[0]
            })
        })
    })
}

async function shortenUrl(url) {
    try {
        const fetch = await import('node-fetch')
        let res = await fetch.default(`https://tinyurl.com/api-create.php?url=${url}`)
        return await res.text()
    } catch {
    }
}

module.exports = { appleMusic, aptoide, fbdl, igdl, mediafire, tiktokdl, tiktokSearch, openAi, pinterest, soundcloud, ytsearch, ytmp3, ytmp4 }