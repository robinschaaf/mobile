package com.zooniversemobile;

import android.util.Log;

import com.facebook.react.bridge.Promise;
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
    public void setInterestSubscription(String interest, Boolean subscribed, Promise promise) {
        Log.d("SUBSCRIBE", "trying to subscribe to interest: " + interest);


        nativePusher = PusherProperty.getInstance().nativePusher;

        if (subscribed) {
            nativePusher.subscribe(interest);
        } else {
            nativePusher.unsubscribe(interest);
        }

        //promise.resolve(interest);

    }

}
