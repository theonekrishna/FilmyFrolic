async function testEndpoints() {
  console.log("🔍 Testing FilmyFrolic Live Endpoints...");

  try {
    const homeRes = await fetch("http://localhost:5000/api/home/movies");
    const homeData = await homeRes.json();
    console.log("✅ GET /api/home/movies Status:", homeRes.status);
    console.log("   Movies Count:", homeData?.data?.length || homeData?.length || 0);
    if (homeData?.data?.[0]) {
      console.log("   Sample Movie:", homeData.data[0].title);
    }
  } catch (err) {
    console.error("❌ GET /api/home/movies Error:", err.message);
  }

  try {
    const archiveRes = await fetch("http://localhost:5000/api/archive");
    const archiveData = await archiveRes.json();
    console.log("✅ GET /api/archive Status:", archiveRes.status);
    console.log("   Archive Count:", archiveData?.data?.length || archiveData?.length || 0);
    if (archiveData?.data?.[0]) {
      console.log("   Sample Archive Item:", archiveData.data[0].title);
    }
  } catch (err) {
    console.error("❌ GET /api/archive Error:", err.message);
  }

  try {
    const tmdbRes = await fetch("http://localhost:5000/api/tmdb/trending");
    const tmdbData = await tmdbRes.json();
    console.log("✅ GET /api/tmdb/trending Status:", tmdbRes.status);
    console.log("   Trending Results:", tmdbData?.results?.length || 0);
  } catch (err) {
    console.error("❌ GET /api/tmdb/trending Error:", err.message);
  }
}

testEndpoints();
