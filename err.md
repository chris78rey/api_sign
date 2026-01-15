
PS G:\opencode\proyectos_opencode\firmas> curl.exe -X POST "http://localhost:3000/api/auth/register" `
>>   -H "Content-Type: application/json" `
>>   -d "{\"organizationName\":\"Org Demo\",\"email\":\"admin@demo.com\",\"password\":\"Passw0rd!\"}"
{"ok":false,"code":"INTERNAL_ERROR","message":"Internal Server Error"}curl: (3) URL rejected: Port number was not a decimal number between 0 and 65535
curl: (3) URL rejected: Port number was not a decimal number between 0 and 65535
PS G:\opencode\proyectos_opencode\firmas>
