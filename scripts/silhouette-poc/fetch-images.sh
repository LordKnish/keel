#!/bin/bash

# Fetch ship images from Wikipedia/Wikimedia Commons using their API
# This respects their rate limits and gets proper thumbnail URLs

cd "$(dirname "$0")/test-images"

fetch_image() {
    local filename="$1"
    local wiki_file="$2"
    local width="${3:-1000}"

    echo "Fetching: $filename from $wiki_file"

    # Get the proper thumbnail URL from Wikipedia API
    local api_url="https://en.wikipedia.org/w/api.php?action=query&titles=File:${wiki_file}&prop=imageinfo&iiprop=url&iiurlwidth=${width}&format=json"

    local thumb_url=$(curl -s "$api_url" | grep -o '"thumburl":"[^"]*"' | head -1 | sed 's/"thumburl":"//;s/"$//')

    if [ -n "$thumb_url" ]; then
        curl -s -L -A "ShipSilhouettePOC/1.0 (research project)" -o "$filename" "$thumb_url"
        if file "$filename" | grep -q "image"; then
            echo "  ✓ Downloaded $(ls -lh "$filename" | awk '{print $5}')"
            return 0
        else
            echo "  ✗ Failed - not an image"
            rm -f "$filename"
            return 1
        fi
    else
        echo "  ✗ Failed to get URL"
        return 1
    fi
}

# Clean up any previous attempts
rm -f *.jpg *.png

# WWII Era ships
fetch_image "uss-enterprise-cv6.jpg" "USS_Enterprise_(CV-6)_in_Puget_Sound,_September_1945.jpg"
sleep 1
fetch_image "bismarck.jpg" "Bundesarchiv_Bild_193-04-1-26,_Schlachtschiff_Bismarck.jpg"
sleep 1
fetch_image "yamato.jpg" "Yamato_sea_trials_2.jpg"
sleep 1
fetch_image "uss-iowa-bb61.jpg" "BB61_USS_Iowa_BB-61_broadside_USN.jpg"
sleep 1
fetch_image "hms-hood.jpg" "HMS_Hood_(51)_-_March_17,_1924.jpg"
sleep 1
fetch_image "uss-fletcher-dd445.jpg" "Fletcher_class_destroyer_DD-445_in_Casco_Bay.jpg"
sleep 1
fetch_image "tirpitz.jpg" "Tirpitz_altafjord.jpg"
sleep 1
fetch_image "uss-lexington-cv2.jpg" "USS_Lexington_(CV-2)_leaving_San_Diego_on_14_October_1941.jpg"
sleep 1

# Modern ships
fetch_image "uss-nimitz-cvn68.jpg" "USS_Nimitz_(CVN-68).jpg"
sleep 1
fetch_image "uss-arleigh-burke.jpg" "USS_Arleigh_Burke_(DDG-51)_steams_through_the_Mediterranean_Sea.jpg"
sleep 1
fetch_image "uss-zumwalt.jpg" "141206-N-CU914-024_The_Navy%27s_newest_guided-missile_destroyer_USS_Zumwalt_(DDG_1000).jpg"
sleep 1

# Cold War era
fetch_image "uss-nautilus.jpg" "USS_Nautilus_(SSN-571).jpg"
sleep 1
fetch_image "uss-forrestal.jpg" "USS_Forrestal_(CVA-59)_underway_at_sea_in_1957.jpg"
sleep 1
fetch_image "hms-invincible.jpg" "HMS_Invincible_(R05)_Dragon_Hammer_90.jpg"
sleep 1

# Sailing ships
fetch_image "hms-victory.jpg" "HMS_Victory_1884.jpg"
sleep 1
fetch_image "uss-constitution.jpg" "USS_Constitution_underway,_August_19,_2012_by_Castle_Island_1.jpg"
sleep 1

# WWI Era
fetch_image "hms-dreadnought.jpg" "HMS_Dreadnought_1906_H61017.jpg"
sleep 1
fetch_image "sms-goeben.jpg" "SMS_Goeben_-_Yavuz.jpg"
sleep 1

# Submarines
fetch_image "u-boat-u47.jpg" "German_Type_VIIB_submarine_U-47.jpg"
sleep 1
fetch_image "uss-los-angeles.jpg" "Los_Angeles_class_submarine.jpg"
sleep 1

# Cruisers
fetch_image "prinz-eugen.jpg" "Bundesarchiv_DVM_10_Bild-23-63-06,_Schwerer_Kreuzer_%22Prinz_Eugen%22.jpg"
sleep 1
fetch_image "uss-indianapolis.jpg" "USS_Indianapolis_(CA-35)_underway_in_1939.jpg"
sleep 1

echo ""
echo "Downloaded images:"
ls -la *.jpg *.png 2>/dev/null || echo "No images downloaded"
