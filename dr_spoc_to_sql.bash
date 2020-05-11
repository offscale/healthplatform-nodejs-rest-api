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
  printf '%s\t%s\n' "${encoded}" 'image/jpeg'
}

export -f rawurlencode

echo 'COPY public.artifact_tbl (location, "contentType") FROM stdin;'
find "$SAMPLE_DATA_PATH" -type f -iname '*.jpg' -exec bash -c 'rawurlencode "{}"' \;
echo '\.'
