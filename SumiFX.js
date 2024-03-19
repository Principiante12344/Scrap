const { search, download } = require('aptoide-scraper')
const { youtubedl, youtubedlv2 } = require('@bochilteam/scraper')
const yts = require('yt-search')
const axios = require('axios')
const cheerio = require('cheerio')

async function appleMusic(text) {
    try {
        const { default: fetch } = await import('node-fetch')
        let api = await fetch(`https://delirius-api.vercel.app/api/applemusic?text=${text}`)
        let data = await api.json()

        let formattedResults = []
        if (data && data.length > 0) {
            for (let i = 0; i < (data.length <= 50 ? data.length : 50); i++) {
                let result = data[i];
                let formattedResult = {
                    nro: i + 1,
                    title: result.title,
                    artist: result.artists,
                    type: result.type,
                    url: result.url
                };
                formattedResults.push(formattedResult)
            }
        }

        return formattedResults
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
      let res = encodeURIComponent(text)
      let msg = await SumiFX(res)
      return { msg }
     } catch {
    }
}

async function SumiFX(content, senderName) {
     let url = 'https://c3.a0.chat/v1/chat/gpt/'
       let headers = {
'Content-Type': 'application/json',
'User-Agent': 'Mozilla/5.0 (Linux; Android 11; M2004J19C Build/RP1A.200720.011) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/103.0.5060.129 Mobile Safari/537.36 WhatsApp/1.2.3',
'Referer': 'https://c3.a0.chat/#/web/chat'
       }
         const datos = {
           list: [
        {
         content: content,
          role: "user",
            nickname: senderName,
           time: "2023-9-19 14:30:08",
          isMe: true,
            index: 0
         }
       ],
        id: 1695108574472,
          title: "Ai Hoshino",
            time: "2023-9-19 14:29:34",
        prompt: "Actuaras como un Bot de WhatsApp el cual fue creado por おDanịel.xyz⁩, tu seras Ai Hoshino, basada en la Idol Ai Hoshino del manga Oshi No Ko, y tu manera de expresarte será actuando como mujer alegre.",
        models: 0,
          temperature: 0,
           continuous: true
       }
         try {
            let ress = await axios.post(url, datos, { headers })
           return ress.data
         } catch {
         }
       }

async function pinterest(query) {
    try {
        const fetch = await import('node-fetch')
        let res = await fetch.default(`https://www.pinterest.com/resource/BaseSearchResource/get/?source_url=%2Fsearch%2Fpins%2F%3Fq%3D${query}&data=%7B%22options%22%3A%7B%22isPrefetch%22%3Afalse%2C%22query%22%3A%22${query}%22%2C%22scope%22%3A%22pins%22%2C%22no_fetch_context_on_resource%22%3Afalse%7D%2C%22context%22%3A%7B%7D%7D&_=1619980301559`)
        let json = await res.json()
        let data = json?.resource_response?.data?.results
        let imageUrl = data[~~(Math.random() * (data?.length))]?.images?.orig?.url
        return imageUrl
    } catch {
        return null
    }
}

async function tiktokdl(url) {
    try {
        let api = await axios.get(`https://api.tiklydown.eu.org/api/download?url=${encodeURIComponent(url)}`)
        let videoData = api.data.video || {}
        let videoURL = videoData.noWatermark || videoData.watermark
        let dl_url = await shortenUrl(videoURL)
        return { dl_url }
    } catch {
        return {}
    }
}

async function tiktokSearch(text) {
    try {
      const { default: fetch } = await import('node-fetch')
        let api = await fetch(`https://api.yanzbotz.my.id/api/cari/tiktok?query=${text}`)
        let data = await api.json()

        let formattedResults = []
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
                formattedResults.push(formattedResult)
            }
        } else {
        }

        return { thumbnail, formattedResults }
    } catch {
    }
}

async function ytmp3(link) {
    try {
        let q = '128kbps'
        let yt = await youtubedl(link).catch(async () => await youtubedlv2(link))
        let url = await yt.audio[q].download()
        let title = await yt.title
        let size = await yt.audio[q].fileSizeH
        let thum = yt.thumbnail
        let thumbnail = await shortenUrl(thum)
        let dl_url = await shortenUrl(url)

        return { title, size, thumbnail, dl_url }
    } catch {
    }
}

async function ytmp4(link) {
    try {
        let q = '360p'
        let yt = await youtubedl(link).catch(async () => await youtubedlv2(link))
        let url = await yt.video[q].download()
        let title = await yt.title
        let size = await yt.video[q].fileSizeH
        let thum = yt.thumbnail
        let thumbnail = await shortenUrl(thum)
        let dl_url = await shortenUrl(url)
        
        return { title, size, thumbnail, dl_url }
    } catch {
    }
}

async function ytsearch(query) {
    try {
        let results = await yts(query)
        let videos = results.all.filter(v => v.type === "video").slice(0, 50)

        let formattedVideos = videos.map((video, index) => {
            return {
                nro: index + 1,
                title: video.title,
                duration: video.timestamp || '×',
                published: video.ago,
                author: video.author.name || '×',
                thumbnail: video.image,
                url: 'https://youtu.be/' + video.videoId
            }
        })

        return formattedVideos
    } catch {
    }
}

async function shortenUrl(url) {
    try {
        const fetch = await import('node-fetch')
        let res = await fetch.default(`https://tinyurl.com/api-create.php?url=${url}`)
        return await res.text()
    } catch {
    }
}

module.exports = { appleMusic, aptoide, fbdl, tiktokdl, tiktokSearch, openAi, pinterest, ytsearch, ytmp3, ytmp4 }