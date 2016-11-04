package com.zooniversemobile;

import android.util.Log;

import com.facebook.react.bridge.ReactApplicationContext;
import com.facebook.react.bridge.ReactContextBaseJavaModule;
import com.facebook.react.bridge.ReactMethod;

/**
 * Created by rschaaf on 11/4/16.
 */


public class NotificationSettings extends ReactContextBaseJavaModule {

    private static final String DURATION_SHORT_KEY = "SHORT";
    private static final String DURATION_LONG_KEY = "LONG";

    public NotificationSettings(ReactApplicationContext reactContext) {
        super(reactContext);
    }

    @Override
    public String getName() {
        return "NotificationSettings";
    }

    @ReactMethod
    public void subscribe(String interest) {
        //Toast.makeText(getReactApplicationContext(), message, duration).show();
        Log.d("SUBSCRIBE", "trying to subscribe to interest: " + interest);
    }

}
