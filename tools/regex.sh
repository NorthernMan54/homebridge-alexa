echo "PUT /characteristics HTTP/1.1" | egrep "/HTTP\/(1\.0|1\.1|2\.0)\s+(\d+)\s+([\w\s-_]+)/i"
echo "HTTP/1.1 207 Multi-Status" | egrep /(HTTP|EVENT)\s+\/(1\.0|1\.1|2\.0)\s+(\d+)\s+([\w\s-_]+)/i
echo "HTTP/1.1 200 OK" | egrep /(HTTP|EVENT)\s+\/(1\.0|1\.1|2\.0)\s+(\d+)\s+([\w\s-_]+)/i
echo "EVENT/1.0 200 OK" | egrep /(HTTP|EVENT)\s+\/(1\.0|1\.1|2\.0)\s+(\d+)\s+([\w\s-_]+)/i
