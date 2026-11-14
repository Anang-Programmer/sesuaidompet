const supabaseUrl = 'https://lvxbxjzodtcqspwlpbuc.supabase.co';
const anonKey = 'sb_publishable_4EFmcXm4zIAKJ6kBNTM9Ng_Yn1fFdjd';

async function testExtract() {
  const url = `${supabaseUrl}/functions/v1/sedo-ai`;
  console.log('Testing extract_and_lookup with: Bandingkan Redmi Note 13 vs Poco M6 Pro');

  try {
    const res = await fetch(url, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${anonKey}`,
        'apikey': anonKey,
      },
      body: JSON.stringify({
        action: 'extract_and_lookup',
        message: 'Bandingkan Redmi Note 13 vs Poco M6 Pro',
        existingPhones: [],
      }),
    });

    console.log('Status:', res.status, res.statusText);
    const data = await res.json();
    console.log('Result:', JSON.stringify(data, null, 2));
  } catch (err) {
    console.error('Error:', err.message);
  }
}

testExtract();

