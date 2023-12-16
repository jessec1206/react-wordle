#!/bin/bash


fr=1
to=300
cat /dev/null > freq.txt
while [[ "$fr" -lt 10000 ]]; do

    if [[ ! -f "freqs/$fr-$to.html" ]]; then
        set -x
        curl -s -X POST https://elearning.ling.sinica.edu.tw/Cfindranking.php -d "From=$fr" -d "To=$to" -d "B7=送出" > "freqs/$fr-$to.html"
        sleep 10
        set +x
    fi
    echo "$fr ~ $to"

    cat "freqs/$fr-$to.html" | xq -q 'tr td' | python3 -c 'import sys; sys.stdout.write("\n".join(line.decode("big5", errors="replace") for line in sys.stdin.buffer.read().split(b"\n")))' | grep '(' | sed 's/(.*//;' >> freq.txt
    fr=$((fr + 300))
    to=$((to + 300))
done
