const Parser = require('icecast-parser');
const albumArt = require('album-art')
const moment = require("moment")
const axios = require('axios');

const radioStation = new Parser({
    url: 'http://176.175.17.23:8001/', // URL to radio station
    userAgent: 'Parse-Icy', // userAgent to request
    keepListen: false, // don't listen radio station after metadata was received
    autoUpdate: true, // update metadata after interval
    //   errorInterval: 10 * 60, // retry connection after 10 minutes
    //   emptyInterval: 5 * 60, // retry get metadata after 5 minutes
    metadataInterval: 20, // update metadata after 5 seconds
});

const titleRegex = /\w[^-]*$/
const artistRegex = /^[^-]*[^ -]/

const headers = {
    headers: {
        'User-Agent': {
            appName: "radiobam.org",
            appVersion: "localhost - dev version",
            appContactInfo: "reynaudtimothee@gmail.com"
        }
    }
}

async function getTracksDetails(trackTitle, artist, fullName, db) {
    // 1. Get all artists
        // 1.1 Remove featuring artist
    const artistWithOFeaturing = artist.replace(/(feat.|Feat.).*$/, "")
        // 1.2 Search all artist
    axios.get(`http://musicbrainz.org/ws/2/artist/?query=artist:${artistWithOFeaturing}?inc=url-rels`, headers)
        .then(artists => pickBestArtist(artists.data))
        .catch(err => console.log("errors:", err))

    // 2. Pick the best artist
    const pickBestArtist = (searchedArtists) => {
        // trying to make a decision
        // const matchingArtist = searchedArtists.artists.find(art => art && (art.name == artist))
        const matchingArtist = searchedArtists.artists[0];
        console.log(`starting to process releases for ${matchingArtist.name} - ${matchingArtist.id}`)
        const artistId = matchingArtist.id
        queryReleasesTrackList(artistId)
        getArtistImage()
    }

    // 3. Query releases tracklist each second
    const queryReleasesTrackList = (artistId) => {
        axios.get(`http://musicbrainz.org/ws/2/artist/${artistId}?inc=aliases+releases+release-rels+recording-rels`)
            .then(artistReleases => {
                const queryReleasesAfterOneSec = (release) => {
                    return new Promise(res => {
                        setTimeout(_ => {
                            axios.get(`http://musicbrainz.org/ws/2/release/${release.id}?inc=artist-credits+labels+discids+recordings`, headers)
                                .then(trackList => isTrackIncluded(trackList.data.media[0].tracks, trackTitle, release))
                                .catch(err => console.log("error in parsing release", err))
                            res();
                        }, 2000);
                    });
                }
                const queryReleaseSubsequently = (sequence) => {
                    let item = sequence.shift();
                    return item ? queryReleasesAfterOneSec(item).then(queryReleaseSubsequently.bind(null, sequence)) : Promise.resolve();
                }

                queryReleaseSubsequently(artistReleases.data.releases).then(_ => {
                    // this code will run after all classes have been added.
                    console.log('all done');
                });
            })
            .catch(err => console.log(err))
    }
    // 4. Check if track is included in release tracklist

    const isTrackIncluded = (trackList, trackTitle, release) => {
        console.log(release.id)
        // should check is track name is included and not strictly equal to
        const track = trackList.find(track => track && (
            (track.title == trackTitle) || track.title.includes(trackTitle) || trackTitle.includes(track.title)
            ))
        track && getCover(release)
    }

    // 5. Get release cover
    const getCover = async (release) => {
        console.log("researching the cover:", release.title)
        axios.get(`http://coverartarchive.org/release/${release.id}`)
                .then(response => {
                    console.log(response.data.images[0].image)
                    updateTrackCoverDetails({cover: response.data.images[0].image, record: release.title})
                }).catch(_ => {
                    console.log("not found in coverArtArchive, trying lastfm")
                    albumArt(artist, { album: release.title })
                        .then(lastFmRes => lastFmRes.includes("https://lastfm") && updateTrackCoverDetails({cover: lastFmRes, record: release.title}))
                        .catch(_ => console.log("no chance with last fm either"))
                })
    }

    // 6. Get artist image
    const getArtistImage = () => {
        albumArt(artist)
            .then(lastFmRes => lastFmRes.includes("https://lastfm") && updateTrackCoverDetails({artistCover: lastFmRes}))
            .catch(_ => console.log("could not find artist image"))
    }
    // 7. Mutate Track to update cover and album details
    const updateTrackCoverDetails = async (data) => {
        // console.log("will update the track details with:", cover, record)
        // 1. Query track
        const track = await db.query.track({
            where: {
                fullName
            }
        })
        // 2. Mutate track
        await db.mutation.updateTrack({
            data: {
                ...data,
            },
            where: { id: track.id }
        })
    }

}

function getTracks(db) {    
    radioStation.on('metadata', async function (metadata) {
        const fullName = metadata.StreamTitle
        const artist = fullName.match(artistRegex)[0]
        const title = fullName.match(titleRegex)[0]
        const track = await db.query.track({where:  {
            fullName
        }})
        // getTracksDetails(title, artist, fullName, db)
        if (!track) {
            await db.mutation.createTrack({
                data: {
                    fullName,
                    artist,
                    track: title
                }
            })
            getTracksDetails(title, artist, fullName, db)
        } else {
            const lastPlayedAt = moment(track.updatedAt).fromNow(true)
            if (!lastPlayedAt.includes("minutes") && !lastPlayedAt.includes("seconds")) {
                await db.mutation.updateTrack({
                    data: {
                        fullName: track.fullName
                    },
                    where: { id: track.id }
                })
            }
        }
    });
}

module.exports = getTracks;

// useful links : 
// https://musicbrainz.org/release/c96d6546-25e4-4717-b514-62684245675f
// https://github.com/Borewit/musicbrainz-api
// https://wiki.musicbrainz.org/Development/XML_Web_Service/Version_2/Search#Release
// https://stackoverflow.com/questions/17470059/getting-a-tracklist-from-musicbrainz?rq=1
// https://musicbrainz.org/doc/Development/XML_Web_Service/Version_2#Subqueries