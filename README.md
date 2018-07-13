# 接入说明文档  

## 接入步骤  

1. **申请终端信息**  

    系统获得接入系统的回调地址后，将`clientId`、`clientSecret`、`templateId`分配给接入系统

2. **获取授权认证**  

    接入系统通过`系统授权接口`获取系统的`access_token`  

3. **调用Myinfo网站**  

    接入系统通过`Myinfo调用接口`调起Myinfo的授权页等待用户授权  

4. **用户授权回调**  

    用户完成授权后系统将获取的用户信息通过接入系统的回调地址发送给接入系统  

## 接口说明  

### 系统授权接口  

- 接口地址  
    ```
    http://localhost:3001/oauth/token
    ```

- 接口使用  
    * **Headers**  
        * **Authorization**: `"Basic " + clientId:clientSecret base64'd`  

            for example, to use `confidentialApplication:topSecret`, you should send `Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0`

        * **Content-Type**: `application/x-www-form-urlencoded`

    * **Body**
        * `grant_type=client_credentials`

    使用`curl`的事例:
    ```
    curl http://localhost:3001/oauth/token \
    -d "grant_type=client_credentials" \
    -H "Authorization: Basic Y29uZmlkZW50aWFsQXBwbGljYXRpb246dG9wU2VjcmV0" \
    -H "Content-Type: application/x-www-form-urlencoded"
    ```

	* **返回参数**  
		* access_token  
		
			系统的授权token,调用`Myinfo调用接口`时需要用到

		* expires_in  

			系统授权token的有效期，单位是秒

    返回的结果:

    ```
    { 
		token_type: 'bearer',
  	access_token:'eyJhbGciOiJIUzI1NiJ9.YXBwbGljYXRpb24xOjE1MzEyOTYwNjYxNjE.o8MxV1RqtyTzim6_6-EErytnIicUkjv2Ih-RAwbXdT4',
  	expires_in: 300
	}
    ```

### Myinfo调用接口  

接口是get请求需要`access_token`、`templateId`两个参数  

- 接口地址  

    ```
    http://localhost:3001
    ```

- 参数说明  
    - access_token  

        通过系统授权接口获取的access_token  

    - templateId  

        获取用户信息的模板ID，不同的模板ID对应获取用户不同的参数  

    - state  

        通过回调URL发送给您，为每个调用使用唯一的系统生成号码。

    调用事例:

    ```
    http://localhost:3001?access_token=eyJhbGciOiJIUzI1NiJ9.YXBwbGljYXRpb24xOjE1MzEyOTYwNjYxNjE.o8MxV1RqtyTzim6_6-EErytnIicUkjv2Ih-RAwbXdT4&templateId=temp1&state=1234567890
    ```

## 回调处理  

用户完成授权后，系统将获取的用户信息通过接入系统的回调地址发送给接入系统；接入系统需要提供一个get请求的回调接口，回调接口接收一个data参数，接入系统接收到data数据后需要使用clientSecret做[JWT](https://jwt.io)(HMAC SHA256)解密获来取用户信息  

### 回调事例    

- state  

    调用`Myinfo调用接口`时发送的state数据，回调时返回给您

- data  

  包含states、msy两个数据的JSON格式数据，使用clientSecret做JWT加密，使用是需要用clientSecret做JWT的解密

回调参数事例:  
```
http://localhost:3000/callback?    state=1234567890&data=eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJzdGF0dXMiOiJTVUNDRVNTIiwibXNnIjp7ImVkdWxldmVsIjp7Imxhc3R1cGRhdGVkIjoiMjAxOC0wNi0yMyIsInNvdXJjZSI6IjIiLCJjbGFzc2lmaWNhdGlvbiI6IkMiLCJ2YWx1ZSI6IjMifSwicmVnYWRkIjp7ImNvdW50cnkiOiJTRyIsInVuaXQiOiIxMjgiLCJzdHJlZXQiOiJCRURPSyBOT1JUSCBBVkVOVUUgNCIsImxhc3R1cGRhdGVkIjoiMjAxOC0wMy0yMCIsImJsb2NrIjoiMTAyIiwic291cmNlIjoiMSIsInBvc3RhbCI6IjQ2MDEwMiIsImNsYXNzaWZpY2F0aW9uIjoiQyIsImZsb29yIjoiMDkiLCJidWlsZGluZyI6IiJ9LCJtb2JpbGVubyI6eyJjb2RlIjoiNjUiLCJwcmVmaXgiOiIrIiwibGFzdHVwZGF0ZWQiOiIyMDE4LTA3LTEyIiwic291cmNlIjoiNCIsImNsYXNzaWZpY2F0aW9uIjoiQyIsIm5iciI6Ijk3Mzk5MjQ1In0sImhhbnl1cGlueWlubmFtZSI6eyJsYXN0dXBkYXRlZCI6IiIsInNvdXJjZSI6IjEiLCJjbGFzc2lmaWNhdGlvbiI6IkMiLCJ2YWx1ZSI6IiJ9LCJtYXJyaWVkbmFtZSI6eyJsYXN0dXBkYXRlZCI6IiIsInNvdXJjZSI6IjEiLCJjbGFzc2lmaWNhdGlvbiI6IkMiLCJ2YWx1ZSI6IiJ9LCJlbWFpbCI6eyJsYXN0dXBkYXRlZCI6IjIwMTgtMDctMTIiLCJzb3VyY2UiOiI0IiwiY2xhc3NpZmljYXRpb24iOiJDIiwidmFsdWUiOiJteWluZm90ZXN0aW5nQGdtYWlsLmNvbSJ9LCJyYWNlIjp7Imxhc3R1cGRhdGVkIjoiMjAxOC0wMy0yMCIsInNvdXJjZSI6IjEiLCJjbGFzc2lmaWNhdGlvbiI6IkMiLCJ2YWx1ZSI6IkNOIn0sImhvdXNpbmd0eXBlIjp7Imxhc3R1cGRhdGVkIjpudWxsLCJzb3VyY2UiOiIxIiwiY2xhc3NpZmljYXRpb24iOiJDIiwidmFsdWUiOiIifSwic2V4Ijp7Imxhc3R1cGRhdGVkIjoiMjAxOC0wMy0yMCIsInNvdXJjZSI6IjEiLCJjbGFzc2lmaWNhdGlvbiI6IkMiLCJ2YWx1ZSI6IkYifSwiaGRidHlwZSI6eyJsYXN0dXBkYXRlZCI6IjIwMTgtMDMtMjEiLCJzb3VyY2UiOiIxIiwiY2xhc3NpZmljYXRpb24iOiJDIiwidmFsdWUiOiIxMTEifSwiaGFueXVwaW55aW5hbGlhc25hbWUiOnsibGFzdHVwZGF0ZWQiOiIiLCJzb3VyY2UiOiIxIiwiY2xhc3NpZmljYXRpb24iOiJDIiwidmFsdWUiOiIifSwibWFyaXRhbCI6eyJsYXN0dXBkYXRlZCI6IjIwMTgtMDMtMjEiLCJzb3VyY2UiOiIxIiwiY2xhc3NpZmljYXRpb24iOiJDIiwidmFsdWUiOiIxIn0sImFsaWFzbmFtZSI6eyJsYXN0dXBkYXRlZCI6IjIwMTgtMDMtMjAiLCJzb3VyY2UiOiIxIiwiY2xhc3NpZmljYXRpb24iOiJDIiwidmFsdWUiOiJUUklDSUEgVEFOIFhJQU8gSFVJIn0sIm5hdGlvbmFsaXR5Ijp7Imxhc3R1cGRhdGVkIjoiMjAxOC0wMy0yMCIsInNvdXJjZSI6IjEiLCJjbGFzc2lmaWNhdGlvbiI6IkMiLCJ2YWx1ZSI6IlNHIn0sImRvYiI6eyJsYXN0dXBkYXRlZCI6IjIwMTgtMDMtMjAiLCJzb3VyY2UiOiIxIiwiY2xhc3NpZmljYXRpb24iOiJDIiwidmFsdWUiOiIxOTcwLTA1LTE3In0sIm5hbWUiOnsibGFzdHVwZGF0ZWQiOiIyMDE4LTAzLTIwIiwic291cmNlIjoiMSIsImNsYXNzaWZpY2F0aW9uIjoiQyIsInZhbHVlIjoiVEFOIFhJQU8gSFVJIn0sImNwZmNvbnRyaWJ1dGlvbnMiOnsiY3BmY29udHJpYnV0aW9uIjpbeyJkYXRlIjoiMjAxNi0xMi0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNi0xMSIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTYtMTItMTIiLCJhbW91bnQiOiI1MDAuMDAiLCJtb250aCI6IjIwMTYtMTIiLCJlbXBsb3llciI6IkNyeXN0YWwgSG9yc2UgSW52ZXN0IFB0ZSBMdGQifSx7ImRhdGUiOiIyMDE2LTEyLTIxIiwiYW1vdW50IjoiNTAwLjAwIiwibW9udGgiOiIyMDE2LTEyIiwiZW1wbG95ZXIiOiJDcnlzdGFsIEhvcnNlIEludmVzdCBQdGUgTHRkIn0seyJkYXRlIjoiMjAxNy0wMS0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNi0xMiIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTctMDEtMTIiLCJhbW91bnQiOiI1MDAuMDAiLCJtb250aCI6IjIwMTctMDEiLCJlbXBsb3llciI6IkNyeXN0YWwgSG9yc2UgSW52ZXN0IFB0ZSBMdGQifSx7ImRhdGUiOiIyMDE3LTAxLTIxIiwiYW1vdW50IjoiNTAwLjAwIiwibW9udGgiOiIyMDE3LTAxIiwiZW1wbG95ZXIiOiJDcnlzdGFsIEhvcnNlIEludmVzdCBQdGUgTHRkIn0seyJkYXRlIjoiMjAxNy0wMi0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNy0wMSIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTctMDItMTIiLCJhbW91bnQiOiI1MDAuMDAiLCJtb250aCI6IjIwMTctMDIiLCJlbXBsb3llciI6IkNyeXN0YWwgSG9yc2UgSW52ZXN0IFB0ZSBMdGQifSx7ImRhdGUiOiIyMDE3LTAyLTIxIiwiYW1vdW50IjoiNTAwLjAwIiwibW9udGgiOiIyMDE3LTAyIiwiZW1wbG95ZXIiOiJDcnlzdGFsIEhvcnNlIEludmVzdCBQdGUgTHRkIn0seyJkYXRlIjoiMjAxNy0wMy0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNy0wMiIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTctMDMtMTIiLCJhbW91bnQiOiI1MDAuMDAiLCJtb250aCI6IjIwMTctMDMiLCJlbXBsb3llciI6IkNyeXN0YWwgSG9yc2UgSW52ZXN0IFB0ZSBMdGQifSx7ImRhdGUiOiIyMDE3LTAzLTIxIiwiYW1vdW50IjoiNTAwLjAwIiwibW9udGgiOiIyMDE3LTAzIiwiZW1wbG95ZXIiOiJDcnlzdGFsIEhvcnNlIEludmVzdCBQdGUgTHRkIn0seyJkYXRlIjoiMjAxNy0wNC0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNy0wMyIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTctMDQtMTIiLCJhbW91bnQiOiI1MDAuMDAiLCJtb250aCI6IjIwMTctMDQiLCJlbXBsb3llciI6IkNyeXN0YWwgSG9yc2UgSW52ZXN0IFB0ZSBMdGQifSx7ImRhdGUiOiIyMDE3LTA0LTIxIiwiYW1vdW50IjoiNTAwLjAwIiwibW9udGgiOiIyMDE3LTA0IiwiZW1wbG95ZXIiOiJDcnlzdGFsIEhvcnNlIEludmVzdCBQdGUgTHRkIn0seyJkYXRlIjoiMjAxNy0wNS0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNy0wNCIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTctMDUtMTIiLCJhbW91bnQiOiI1MDAuMDAiLCJtb250aCI6IjIwMTctMDUiLCJlbXBsb3llciI6IkNyeXN0YWwgSG9yc2UgSW52ZXN0IFB0ZSBMdGQifSx7ImRhdGUiOiIyMDE3LTA1LTIxIiwiYW1vdW50IjoiNTAwLjAwIiwibW9udGgiOiIyMDE3LTA1IiwiZW1wbG95ZXIiOiJDcnlzdGFsIEhvcnNlIEludmVzdCBQdGUgTHRkIn0seyJkYXRlIjoiMjAxNy0wNi0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNy0wNSIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTctMDYtMTIiLCJhbW91bnQiOiI1MDAuMDAiLCJtb250aCI6IjIwMTctMDYiLCJlbXBsb3llciI6IkNyeXN0YWwgSG9yc2UgSW52ZXN0IFB0ZSBMdGQifSx7ImRhdGUiOiIyMDE3LTA2LTIxIiwiYW1vdW50IjoiNTAwLjAwIiwibW9udGgiOiIyMDE3LTA2IiwiZW1wbG95ZXIiOiJDcnlzdGFsIEhvcnNlIEludmVzdCBQdGUgTHRkIn0seyJkYXRlIjoiMjAxNy0wNy0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNy0wNiIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTctMDctMTIiLCJhbW91bnQiOiI1MDAuMDAiLCJtb250aCI6IjIwMTctMDciLCJlbXBsb3llciI6IkNyeXN0YWwgSG9yc2UgSW52ZXN0IFB0ZSBMdGQifSx7ImRhdGUiOiIyMDE3LTA3LTIxIiwiYW1vdW50IjoiNTAwLjAwIiwibW9udGgiOiIyMDE3LTA3IiwiZW1wbG95ZXIiOiJDcnlzdGFsIEhvcnNlIEludmVzdCBQdGUgTHRkIn0seyJkYXRlIjoiMjAxNy0wOC0wMSIsImFtb3VudCI6IjUwMC4wMCIsIm1vbnRoIjoiMjAxNy0wNyIsImVtcGxveWVyIjoiQ3J5c3RhbCBIb3JzZSBJbnZlc3QgUHRlIEx0ZCJ9LHsiZGF0ZSI6IjIwMTctMDgtMTIiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMDgiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMDgtMjEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMDgiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMDktMDEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMDgiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMDktMTIiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMDkiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMDktMjEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMDkiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTAtMDEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMDkiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTAtMTIiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTAiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTAtMjEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTAiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTEtMDEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTAiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTEtMTIiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTEiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTEtMjEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTEiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTItMDEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTEiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTItMTIiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTIiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTctMTItMjEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTIiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTgtMDEtMDEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTctMTIiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTgtMDEtMTIiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTgtMDEiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9LHsiZGF0ZSI6IjIwMTgtMDEtMjEiLCJhbW91bnQiOiI3NTAuMDAiLCJtb250aCI6IjIwMTgtMDEiLCJlbXBsb3llciI6IkRlbHRhIE1hcmluZSBDb25zdWx0YW50cyBQTCJ9XSwibGFzdHVwZGF0ZWQiOiIyMDE1LTEyLTIzIiwic291cmNlIjoiMSIsImNsYXNzaWZpY2F0aW9uIjoiQyJ9LCJjcGZiYWxhbmNlcyI6eyJvYSI6IjE1ODEuNDgiLCJtYSI6IjExNDcwLjcwIiwibGFzdHVwZGF0ZWQiOiIyMDE1LTEyLTIzIiwic291cmNlIjoiMSIsImNsYXNzaWZpY2F0aW9uIjoiQyIsInNhIjoiMjE5NjcuMDkifSwiYXNzZXNzYWJsZWluY29tZSI6eyJsYXN0dXBkYXRlZCI6IjIwMTUtMTItMjMiLCJzb3VyY2UiOiIxIiwiY2xhc3NpZmljYXRpb24iOiJDIiwidmFsdWUiOiIxNDU2Nzg5LjAwIn0sInVpbmZpbiI6IlM5ODEyMzgxRCJ9LCJpYXQiOjE1MzEzNTY3NTB9.Lt-2HOejcH01sOxbaOIGp9tFUNXay3jyK9bZaUdKAjg
```

data参数解密后参数事例:  
```
{
    "status": "SUCCESS",
    "msg": {
        "edulevel": {
            "lastupdated": "2018-06-23",
            "source": "2",
            "classification": "C",
            "value": "3"
        },
        "regadd": {
            "country": "SG",
            "unit": "128",
            "street": "BEDOK NORTH AVENUE 4",
            "lastupdated": "2018-03-20",
            "block": "102",
            "source": "1",
            "postal": "460102",
            "classification": "C",
            "floor": "09",
            "building": ""
        },
        "mobileno": {
            "code": "65",
            "prefix": "+",
            "lastupdated": "2018-07-12",
            "source": "4",
            "classification": "C",
            "nbr": "97399245"
        },
        "hanyupinyinname": {
            "lastupdated": "",
            "source": "1",
            "classification": "C",
            "value": ""
        },
        "marriedname": {
            "lastupdated": "",
            "source": "1",
            "classification": "C",
            "value": ""
        },
        "email": {
            "lastupdated": "2018-07-12",
            "source": "4",
            "classification": "C",
            "value": "myinfotesting@gmail.com"
        },
        "race": {
            "lastupdated": "2018-03-20",
            "source": "1",
            "classification": "C",
            "value": "CN"
        },
        "housingtype": {
            "lastupdated": null,
            "source": "1",
            "classification": "C",
            "value": ""
        },
        "sex": {
            "lastupdated": "2018-03-20",
            "source": "1",
            "classification": "C",
            "value": "F"
        },
        "hdbtype": {
            "lastupdated": "2018-03-21",
            "source": "1",
            "classification": "C",
            "value": "111"
        },
        "hanyupinyinaliasname": {
            "lastupdated": "",
            "source": "1",
            "classification": "C",
            "value": ""
        },
        "marital": {
            "lastupdated": "2018-03-21",
            "source": "1",
            "classification": "C",
            "value": "1"
        },
        "aliasname": {
            "lastupdated": "2018-03-20",
            "source": "1",
            "classification": "C",
            "value": "TRICIA TAN XIAO HUI"
        },
        "nationality": {
            "lastupdated": "2018-03-20",
            "source": "1",
            "classification": "C",
            "value": "SG"
        },
        "dob": {
            "lastupdated": "2018-03-20",
            "source": "1",
            "classification": "C",
            "value": "1970-05-17"
        },
        "name": {
            "lastupdated": "2018-03-20",
            "source": "1",
            "classification": "C",
            "value": "TAN XIAO HUI"
        },
        "cpfcontributions": {
            "cpfcontribution": [{
                "date": "2016-12-01",
                "amount": "500.00",
                "month": "2016-11",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2016-12-12",
                "amount": "500.00",
                "month": "2016-12",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2016-12-21",
                "amount": "500.00",
                "month": "2016-12",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-01-01",
                "amount": "500.00",
                "month": "2016-12",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-01-12",
                "amount": "500.00",
                "month": "2017-01",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-01-21",
                "amount": "500.00",
                "month": "2017-01",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-02-01",
                "amount": "500.00",
                "month": "2017-01",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-02-12",
                "amount": "500.00",
                "month": "2017-02",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-02-21",
                "amount": "500.00",
                "month": "2017-02",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-03-01",
                "amount": "500.00",
                "month": "2017-02",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-03-12",
                "amount": "500.00",
                "month": "2017-03",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-03-21",
                "amount": "500.00",
                "month": "2017-03",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-04-01",
                "amount": "500.00",
                "month": "2017-03",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-04-12",
                "amount": "500.00",
                "month": "2017-04",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-04-21",
                "amount": "500.00",
                "month": "2017-04",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-05-01",
                "amount": "500.00",
                "month": "2017-04",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-05-12",
                "amount": "500.00",
                "month": "2017-05",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-05-21",
                "amount": "500.00",
                "month": "2017-05",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-06-01",
                "amount": "500.00",
                "month": "2017-05",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-06-12",
                "amount": "500.00",
                "month": "2017-06",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-06-21",
                "amount": "500.00",
                "month": "2017-06",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-07-01",
                "amount": "500.00",
                "month": "2017-06",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-07-12",
                "amount": "500.00",
                "month": "2017-07",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-07-21",
                "amount": "500.00",
                "month": "2017-07",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-08-01",
                "amount": "500.00",
                "month": "2017-07",
                "employer": "Crystal Horse Invest Pte Ltd"
            }, {
                "date": "2017-08-12",
                "amount": "750.00",
                "month": "2017-08",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-08-21",
                "amount": "750.00",
                "month": "2017-08",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-09-01",
                "amount": "750.00",
                "month": "2017-08",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-09-12",
                "amount": "750.00",
                "month": "2017-09",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-09-21",
                "amount": "750.00",
                "month": "2017-09",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-10-01",
                "amount": "750.00",
                "month": "2017-09",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-10-12",
                "amount": "750.00",
                "month": "2017-10",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-10-21",
                "amount": "750.00",
                "month": "2017-10",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-11-01",
                "amount": "750.00",
                "month": "2017-10",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-11-12",
                "amount": "750.00",
                "month": "2017-11",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-11-21",
                "amount": "750.00",
                "month": "2017-11",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-12-01",
                "amount": "750.00",
                "month": "2017-11",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-12-12",
                "amount": "750.00",
                "month": "2017-12",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2017-12-21",
                "amount": "750.00",
                "month": "2017-12",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2018-01-01",
                "amount": "750.00",
                "month": "2017-12",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2018-01-12",
                "amount": "750.00",
                "month": "2018-01",
                "employer": "Delta Marine Consultants PL"
            }, {
                "date": "2018-01-21",
                "amount": "750.00",
                "month": "2018-01",
                "employer": "Delta Marine Consultants PL"
            }],
            "lastupdated": "2015-12-23",
            "source": "1",
            "classification": "C"
        },
        "cpfbalances": {
            "oa": "1581.48",
            "ma": "11470.70",
            "lastupdated": "2015-12-23",
            "source": "1",
            "classification": "C",
            "sa": "21967.09"
        },
        "assessableincome": {
            "lastupdated": "2015-12-23",
            "source": "1",
            "classification": "C",
            "value": "1456789.00"
        },
        "uinfin": "S9812381D"
    },
    "iat": 1531356750
}
```

### data解密后参数说明  

- status  

    status的值是'SUCCESS'或'ERROR'

- msg  

    当status的值是'SUCCESS'时，msg中的值是从Myinfo中查询出来的用户信息；当status的值是'ERROR'时，msg中的值是查询信息时的错误提示
    
### 错误列表  

|   status   |   msg   |   remarks   |
| ---- | ---- | ---- |
| ERROR | INVALID TOKEN | Myinfo‘s access_token validation failure |
| ERROR | UINFIN NOT FOUND | User's  uinfin not query |
| ERROR | PERSON DATA NOT FOUND | User's person data not query |
| ERROR | INVALID DATA OR SIGNATURE FOR PERSON DATA | User's person data decrypt failure |

注:当系统在向Myinfo请求数据发生网络异常时，将直接返回异常信息不再返回json格式数据
