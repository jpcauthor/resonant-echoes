export default async function handler(req, res) {
  const code = req.query.code;

  if (!code) {
    return res.redirect('https://jpcauthor.github.io/resonant-echoes/login.html?error=no_code');
  }

  try {
    // Exchange the code for an access token
    const tokenResponse = await fetch('https://github.com/login/oauth/access_token', {
      method: 'POST',
      headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json'
      },
      body: JSON.stringify({
        client_id:     process.env.GITHUB_CLIENT_ID,
        client_secret: process.env.GITHUB_CLIENT_SECRET,
        code
      })
    });

    const tokenData = await tokenResponse.json();

    if (tokenData.error || !tokenData.access_token) {
      return res.redirect('https://jpcauthor.github.io/resonant-echoes/login.html?error=token_failed');
    }

    // Get the user's GitHub username
    const userResponse = await fetch('https://api.github.com/user', {
      headers: {
        'Authorization': `Bearer ${tokenData.access_token}`,
        'Accept': 'application/json'
      }
    });

    const userData = await userResponse.json();
    const username = (userData.login || '').toLowerCase();

    // Approved beta readers — add more usernames here as needed
    const approvedReaders = [
      'jpcauthor',
      'jgriz81'
    ];

    if (!approvedReaders.includes(username)) {
      return res.redirect('https://jpcauthor.github.io/resonant-echoes/login.html?error=not_approved');
    }

    // Approved! Redirect to the book with username in tow
    return res.redirect(
      `https://jpcauthor.github.io/resonant-echoes/book/cover.html?user=${encodeURIComponent(username)}`
    );

  } catch (err) {
    console.error('OAuth error:', err);
    return res.redirect('https://jpcauthor.github.io/resonant-echoes/login.html?error=server_error');
  }
}