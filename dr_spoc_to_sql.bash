#!/usr/bin/env bash

rawurlencode() {
  local string="${1}"
  local strlen=${#string}
  local encoded=""
  local pos c o

  for (( pos=0 ; pos<strlen ; pos++ )); do
     c=${string:$pos:1}
     case "$c" in
        [-_.~a-zA-Z0-9] ) o="${c}" ;;
        * )               printf -v o '%%%02x' "'$c"
     esac
     encoded+="${o}"
  done
  printf "('%s','%s'),\n" "${encoded}" 'image/jpeg'
  # printf '%s\t%s\n' "${encoded}" 'image/jpeg'
}

export -f rawurlencode

# echo 'COPY public.artifact_tbl (location, "contentType") FROM stdin;'
# find "$SAMPLE_DATA_PATH" -type f -iname '*.jpg' -exec bash -c 'rawurlencode "{}"' \;
# echo '\.'


echo 'INSERT INTO public.artifact_tbl (location, "contentType")'
echo 'VALUES'
find "$SAMPLE_DATA_PATH" -type f -iname '*.jpg' -exec bash -c 'rawurlencode "{}"' \;
echo 'ON CONFLICT(location) DO NOTHING;'

# sed -i 's/%2fmnt%2fFundus%20Photographs%20for%20AI/fundus_images/g; s/%2f/%2F/g' ~/import.sql
