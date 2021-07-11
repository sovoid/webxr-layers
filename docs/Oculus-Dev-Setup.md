# Development Setup: Oculus

[Oculus Developer Documentation](https://developer.oculus.com/develop/)

1. Download the Oculus App and login using Facebook
2. Turn on the headset
3. Navigate to devices and select the device
4. Click on 'Developer Mode' and enable it by toggling the switch

<table>
    <tr>
        <td> <img src="./assests/OculusDeveloperMode.PNG" style="border: 1px solid black"/></td>
        <td> <img src="./assests/EnableDevMode.PNG" style="border: 1px solid black"/> </td>
    </tr>
</table>

5. Connect the Oculus device to your machine via USC-C, and upon being prompted, [Enable Developer Mode](https://developer.oculus.com/documentation/native/android/mobile-device-setup/)

1. Install [ADB driver](https://developer.oculus.com/downloads/package/oculus-adb-drivers/) for your OS 

*For Windows*

- Check if the ADB driver path is configured in your global path variable by using the command `echo %PATH%`

- If is it configured correctly, it should be visible such as
 <img src="./assests/ADB_AddedToPath.PNG" style="margin-left: 10px;"/>

- If you cannot see this path `C:\Users\USERNAME\AppData\Local\Android\sdk\platform-tools` present, add it your environment variables either by using the command `setx PATH "%PATH%;C:\Program Files\android-sdk-windows\platform-tools"` or manually by navigating to environment variables and ammending the environment variable: *PATH*

 <img src="./assests/ADB_PathVar.PNG" style="border: 1px solid black; margin-left: 50px; height: 350px;"/>


## Remote Debugging

To check whether your device is connected correctly, use the command `adb devices`. If all is good and the device is detected, you should see the following output:

 <img src="./assests/adbDevices.PNG" style="border: 1px solid black; margin-left: 50px;"/>




