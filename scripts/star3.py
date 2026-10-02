import json
import requests
from urllib.parse import quote

# --- Configuration ---
JSON_URL = "https://sportlink-jtv.pages.dev/hstar.json"
OUTPUT_FILE = "hotstar.m3u"

# Your provided cookie string
COOKIE_STRING = "hdnea=exp=1791007392~acl=%2f*~id=856591516a8b60c6136e1f0574449c68~data=hdntl~hmac=7892bfb7fdfa07d06c25e626ba4da372f356c166aa12e87b7e267d208fbec96b|Cookie=hdntl=exp=1791007392~acl=%2f*~id=856591516a8b60c6136e1f0574449c68~data=hdntl~hmac=7892bfb7fdfa07d06c25e626ba4da372f356c166aa12e87b7e267d208fbec96b"

# Common headers used for Hotstar streams
USER_AGENT = "Virat Kohli"
REFERER = "https://www.hotstar.com/"
ORIGIN = "https://www.hotstar.com"

def fetch_json(url):
    """Fetches the JSON data from the provided URL."""
    try:
        response = requests.get(url, timeout=15)
        response.raise_for_status()
        return response.json()
    except requests.exceptions.RequestException as e:
        print(f"Error fetching JSON data: {e}")
        return None

def generate_m3u(channels, cookie, output_path):
    """Generates the M3U playlist file from the channel list."""
    
    with open(output_path, "w", encoding="utf-8") as f:
        f.write("#EXTM3U\n")

        for ch in channels:
            ch_type = ch.get("type", "").lower()
            name = ch.get("name", "Unknown")
            logo = ch.get("logo", "")
            group = ch.get("group", "Uncategorized")
            url = ch.get("url", "")

            # Basic EXTINF line
            f.write(f'#EXTINF:-1 tvg-name="{name}" tvg-logo="{logo}" group-title="{group}", {name}\n')

            if ch_type == "mpd":
                # Handle MPD (ClearKey DRM) streams
                key_id = ch.get("keyId")
                key = ch.get("key")

                if key_id and key:
                    # KODIPROP for Kodi/IPTV players
                    f.write("#KODIPROP:inputstream=inputstream.adaptive\n")
                    f.write("#KODIPROP:inputstream.adaptive.manifest_type=mpd\n")
                    f.write(f"#KODIPROP:inputstream.adaptive.stream_headers=User-Agent={USER_AGENT}&Referer={REFERER}&Origin={ORIGIN}\n")
                    f.write(f"#KODIPROP:inputstream.adaptive.license_key={key_id}:{key}\n")
                    f.write("#KODIPROP:inputstream.adaptive.license_type=clearkey\n")

            # Common EXTVLCOPT and EXTHTTP headers for all stream types
            # Using the user's specific cookie format
            f.write(f"#EXTVLCOPT:http-user-agent={USER_AGENT}\n")
            f.write(f"#EXTVLCOPT:http-referrer={REFERER}\n")
            f.write(f"#EXTVLCOPT:http-extra-headers=Origin: {ORIGIN}\n")
            f.write(f"#EXTVLCOPT:http-cookie={cookie}\n")

            # JSON-encoded headers for EXTHTTP
            # Safely escape the cookie string for JSON
            import json as json_lib
            exthttp_headers = {
                "Origin": ORIGIN,
                "Referer": REFERER,
                "User-Agent": USER_AGENT,
                "Cookie": cookie
            }
            f.write(f"#EXTHTTP:{json_lib.dumps(exthttp_headers)}\n")

            # Stream URL
            f.write(f"{url}\n\n")

    print(f"M3U playlist successfully created: {output_path}")

def main():
    print(f"Fetching JSON from {JSON_URL}...")
    data = fetch_json(JSON_URL)

    if not data:
        print("Failed to retrieve JSON data. Exiting.")
        return

    # The JSON is a list of channel objects
    channels = data if isinstance(data, list) else []
    
    if not channels:
        print("No channels found in the JSON data. Exiting.")
        return

    print(f"Found {len(channels)} channels. Generating M3U...")
    generate_m3u(channels, COOKIE_STRING, OUTPUT_FILE)

if __name__ == "__main__":
    main()
