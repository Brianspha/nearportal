
const NodeCache = require( "node-cache" );
const cache = new NodeCache( { stdTTL: 600 } );

module.exports={
    cache
}
function getCache(key) {
    console.log("cache: ", cache.get(key));
    return cache.get(key);
  }
  function saveCache(key, object) {
    console.log("saving user cache: ", object, cache.set(key, object));
  }

  module.exports={
      getCache,
      saveCache
  }