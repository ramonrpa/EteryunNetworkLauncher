function parse_str(str) {
    return str.split('&').reduce(function (params, param) {
        var paramSplit = param.split('=').map(function (value) {
            return decodeURIComponent(value.replace('+', ' '))
        })
        params[paramSplit[0]] = paramSplit[1]
        return params
    }, {})
}

function getAudioUrl(vid) {
    return new Promise((resolve, reject) => {
        fetch(`https://www.youtube.com/get_video_info?video_id=${vid}`).then(response => {
            if (response.ok) {
                response.text().then(ytData => {
                    ytData = parse_str(ytData)
                    const getAdaptiveFormats = JSON.parse(ytData.player_response).streamingData.adaptiveFormats
                    const findAudioInfo = getAdaptiveFormats.findIndex(obj => obj.audioQuality)
                    const audioURL = getAdaptiveFormats[findAudioInfo].url
                    resolve(audioURL)
                })
            }
        }).catch(error => {
            reject(error)
        })
    })
}