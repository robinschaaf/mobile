//
//  NotificationSettings.m
//  ZooniverseMobile
//
//  Created by Robin Schaaf on 11/2/16.
//  Copyright © 2016 Zooniverse. All rights reserved.
//

#import "NotificationSettings.h"
#import "RCTLog.h"
#import <Pusher/Pusher.h>

@implementation NotificationSettings

RCT_EXPORT_MODULE();

RCT_EXPORT_METHOD(subscribe:(NSString *)interest)
{
  
  AppDelegate *appDelegate = [[UIApplication sharedApplication] delegate];
  
  RCTLogInfo(@"Pretending to subscribe to interest %@", interest);
  NSLog(@"movescounter is currently equal to %d", appDelegate.movesCounter);
  
  self.pusher = appDelegate.pusher;
  //[[[appDelegate.pusher] nativePusher] subscribe:@"donuts"];
  [[[self pusher] nativePusher] subscribe:interest];
  
  RCTLogInfo(@"Supposedly subscribed to interest %@", interest);
}

@end
