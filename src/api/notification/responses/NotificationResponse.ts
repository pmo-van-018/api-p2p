import { Notification } from '@api/notification/models/Notification';
import { NotificationUser } from '@api/notification/models/NotificationUser';

export class NotificationResponse {
  public id: string;
  public description: string;
  public title: string;
  public userId: string;
  public type: number;
  public link: string;
  public createdAt: Date;
  public updatedAt: Date;
  public status: number;
  public notificationUsers: NotificationUser[];
  constructor(notification: Notification) {
    this.id = notification.id;
    this.description = notification.description;
    this.title = notification.title;
    this.type = notification.type;
    this.link = notification.link;
    this.createdAt = notification.createdAt;
    this.updatedAt = notification.updatedAt;
    this.notificationUsers = notification.notificationUsers;
  }
}
