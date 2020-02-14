const musicBrainzApi = require('musicbrainz-api').MusicBrainzApi;
const albumArt = require('album-art')

// async function getTracksDetails(trackTitle, artist) {
//     const allArtistsFound = await mbApi.search('artist', artist)
//     const record = axios.get(`http://musicbrainz.org/ws/2/artist/${allArtistsFound.artists[0].id}?inc=aliases+releases`, headers)
//         .then(artistReleases => {
//             return artistReleases.data.releases.map(release => {
//                 return axios.get(`http://musicbrainz.org/ws/2/release/${release.id}?inc=artist-credits+labels+discids+recordings`, headers)
//                 .then(tracks => tracks.data.media[0].tracks.find(track => {
//                     let record
//                     if (track.title === trackTitle) {
//                         record = track.recording
//                         return record
//                     }
//                     console.log("record:", record)
//                     return record
//                 }))
//                 .catch(err => console.log("err", err))
//             })
//         })
//     // 
//     // const mbArtist = await mbApi.getArtist(allArtistsFound.artists[0].id, ['releases', 'recordings', 'url-rels']);
//     // console.log(mbArtist);
//     // const record = await mbApi.getRecording(mbArtist.recordings[0].id);
//     // http://musicbrainz.org/ws/2/release/c96d6546-25e4-4717-b514-62684245675f?inc=artist-credits+labels+discids+recordings
//     // axios.get("http://musicbrainz.org/ws/2/release/c96d6546-25e4-4717-b514-62684245675f?inc=artist-credits+labels+discids+recordings")
//     // .then(res => console.log("release:", res.data.media[0].tracks))
//     // console.log(artistRecords)
//     //console.log(artistRecords)
//     //const result = await mbApi.searchReleaseGroupByTitleAndArtist('Racine carrée', 'Stromae');
    
//     // release = await mbApi.getReleaseGroup('19099ea5-3600-4154-b482-2ec68815883e')
//     // console.log(release)
// }

// async function getTracksDetails(trackTitle, artist) {
//     const allRecordsFound = await mbApi.search('recording', trackTitle)
//     const record = allRecordsFound.recordings.find(record => {
//         if (record["artist-credit"][0].name === artist) {
//             return record
//         }
//     })
//     // console.log(record)
//     // axios.get("http://coverartarchive.org/release/76df3287-6cda-33eb-8e9a-044b5e15ffdd")
//     // .then(response => {
//     //     console.log(response.data)
//     // }).catch(error => {
//     //     console.log(error)
//     // })
//     // result = musicbrainzngs.get_releases_by_discid("c96d6546-25e4-4717-b514-62684245675f", includes = ["artists", "recordings"])
//     // console.log(result)
//     const cover = record && await albumArt(artist, { album: record.releases[0].title })
//     const trackDetails = {
//         record: record && record.releases[0].title,
//         cover: typeof cover === "string" && cover
//     }
//     return trackDetails
// }

// const mbApi = new musicBrainzApi({
//     appName: 'radioBam',
//     appVersion: '0.1.0',
//     appContactInfo: 'reynaudtimothee@gmail.com'
// });