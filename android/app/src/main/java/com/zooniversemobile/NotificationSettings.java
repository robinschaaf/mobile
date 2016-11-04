package com.zooniversemobile;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;
import com.pusher.android.notifications.PushNotificationRegistration;

/**
 * Created by rschaaf on 11/4/16.
 */


public class NotificationSettings extends ReactContextBaseJavaModule {
    private PushNotificationRegistration nativePusher = null;

    public NotificationSettings(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NotificationSettings";
    }

    @ReactMethod
    public void subscribe(String interest) {
        Log.d("SUBSCRIBE", "trying to subscribe to interest: " + interest);


        nativePusher = PusherProperty.getInstance().nativePusher;
        nativePusher.subscribe(interest);

        Log.d("SUBSCRIBE", "supposedly subscribed to interest: " + interest);

    }

    @ReactMethod
    public void unsubscribe(String interest) {
        Log.d("SUBSCRIBE", "trying to UNsubscribe to interest: " + interest);

        nativePusher = PusherProperty.getInstance().nativePusher;
        nativePusher.unsubscribe(interest);

        Log.d("SUBSCRIBE", "supposedly UNsubscribed to interest: " + interest);

    }
}
