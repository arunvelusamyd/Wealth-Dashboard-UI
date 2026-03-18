<!DOCTYPE html>
<html>
<head>
  <meta charset="utf-8">
  <meta name="viewport" content="width=device-width, initial-scale=1">
  <title>Wealth Dashboard – Sign In</title>
  <link rel="stylesheet" href="${url.resourcesPath}/css/login.css">
</head>
<body>

  <div class="login-page">
    <div class="login-card">

      <div class="login-logo">
        <span class="login-logo-icon">&#9672;</span>
        <h1>Wealth Dashboard</h1>
      </div>
      <p class="login-subtitle">Sign in to your account(Login)</p>

      <#if message?has_content && message.type == 'error'>
        <div class="login-error">${message.summary}</div>
      </#if>

      <form action="${url.loginAction}" method="post" class="login-form" id="kc-form-login">

        <div class="login-field">
          <label for="username">Username</label>
          <input
            id="username"
            name="username"
            type="text"
            value="${(login.username!'')}"
            placeholder="Enter your username"
            autocomplete="username"
            autofocus
          />
        </div>

        <div class="login-field">
          <label for="password">Password</label>
          <input
            id="password"
            name="password"
            type="password"
            placeholder="Enter your password"
            autocomplete="current-password"
          />
        </div>

        <button type="submit" class="login-btn" id="kc-login">
          Sign In
        </button>

      </form>
    </div>
  </div>

  <script>
    document.getElementById('kc-form-login').addEventListener('submit', function () {
      var btn = document.getElementById('kc-login');
      btn.disabled = true;
      btn.textContent = 'Signing in\u2026';
    });
  </script>

</body>
</html>
