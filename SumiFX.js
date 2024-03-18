// SumiFX
const { youtubedl, youtubedlv2 } = require('@bochilteam/scraper')

async function ytmp3(link) {
    try {
        let q = '128kbps'
        let yt = await youtubedl(link).catch(async () => await youtubedlv2(link))
        let dl_url = await yt.audio[q].download()
        let title = await yt.title
        let size = await yt.audio[q].fileSizeH
        let thumbnail = yt.thumbnail
        
        return { title, size, thumbnail, dl_url }
    } catch {
        throw error
    }
}

module.exports = { ytmp3 }