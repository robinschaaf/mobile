//
//  NotificationSettings.m
//  ZooniverseMobile
//
//  Created by Robin Schaaf on 11/3/16.
//  Copyright © 2016 Zooniverse. All rights reserved.
//

#import "NotificationSettings.h"
#import "RCTLog.h"
#import <Pusher/Pusher.h>

@implementation NotificationSettings

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(subscribe:(NSString *)interest
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  AppDelegate *appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
  
  RCTLogInfo(@"Going to subscribe to interest %@", interest);
  
  self.pusher = appDelegate.pusher;
  [[[self pusher] nativePusher] subscribe:interest];

  resolve(@"Subscribe Successful");
}


RCT_EXPORT_METHOD(unsubscribe:(NSString *)interest
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  AppDelegate *appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
  
  RCTLogInfo(@"Going to UNsubscribe FROM interest %@", interest);
  
  self.pusher = appDelegate.pusher;
  [[[self pusher] nativePusher] unsubscribe:interest];
  
  resolve(@"DID UNsubscribe FROM interest");
}


@end
