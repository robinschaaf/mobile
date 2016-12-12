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

RCT_EXPORT_METHOD(setInterestSubscription:(NSString *)interest
                  subscribed:(BOOL *)subscribed
                  resolver:(RCTPromiseResolveBlock)resolve
                  rejecter:(RCTPromiseRejectBlock)reject)
{
  
  AppDelegate *appDelegate = (AppDelegate*)[[UIApplication sharedApplication] delegate];
  self.pusher = appDelegate.pusher;
  NSLog( @">>>> and... notification settings called!" );
  
  if (subscribed) {
    NSLog(@"sub interest: %@", interest);
    [[[self pusher] nativePusher] subscribe:interest];
    
  } else {
    NSLog(@"unsub: interest: %@", interest);
    [[[self pusher] nativePusher] unsubscribe:interest];
  }
  
  resolve(@"Interest subscription set");
}


@end
