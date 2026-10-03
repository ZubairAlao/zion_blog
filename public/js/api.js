let accessToken = sessionStorage.getItem("accessToken");

let refreshPromise = null;


async function refreshAccessToken() {

  // If another request is already refreshing,
  // wait for that same refresh request.
  if (refreshPromise) {
    return refreshPromise;
  }

  refreshPromise = (async () => {

    try {

      const response = await fetch(
        "/api/auth/refresh",
        {
          method: "POST",
          credentials: "include"
        }
      );


      if (!response.ok) {
        return null;
      }


      const data =
        await response.json();


      if (!data.accessToken) {
        return null;
      }


      accessToken =
        data.accessToken;


      sessionStorage.setItem(
        "accessToken",
        accessToken
      );


      return accessToken;


    } finally {

      refreshPromise = null;
    }

  })();


  return refreshPromise;
}


export async function api(
  url,
  options = {}
) {

  const headers = {
    "Content-Type": "application/json",
    ...(options.headers || {})
  };


  if (accessToken) {
    headers.Authorization =
      `Bearer ${accessToken}`;
  }


  let response = await fetch(
    url,
    {
      ...options,
      headers,
      credentials: "include"
    }
  );


  /*
  |--------------------------------------------------------------------------
  | Request did not return 401
  |--------------------------------------------------------------------------
  */

  if (response.status !== 401) {
    return response;
  }


  /*
  |--------------------------------------------------------------------------
  | 401
  |--------------------------------------------------------------------------
  |
  | Try refresh even if accessToken is null.
  |
  | The refresh token lives in the httpOnly cookie.
  |
  */

  const newAccessToken =
    await refreshAccessToken();


  /*
  |--------------------------------------------------------------------------
  | Refresh failed
  |--------------------------------------------------------------------------
  */

  if (!newAccessToken) {

    accessToken = null;

    sessionStorage.removeItem(
      "accessToken"
    );

    return response;
  }


  /*
  |--------------------------------------------------------------------------
  | Retry original request
  |--------------------------------------------------------------------------
  */

  headers.Authorization =
    `Bearer ${newAccessToken}`;


  return fetch(
    url,
    {
      ...options,
      headers,
      credentials: "include"
    }
  );
}

