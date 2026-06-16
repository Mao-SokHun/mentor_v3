import sequelize from '../config/config.js';

// Import all models
import UserType from './userTypeModel.js';
import User from './userModel.js';
import UserSession from './userSessionModel.js';
import Admin from './adminModel.js';
import Student from './studentModel.js';
import Mentor from './mentorModel.js';
import MentorPortfolio from './mentorPortfolioModel.js';
import Skill from './skillModel.js';
import SubSkill from './subSkillModel.js';
import MentorSkill from './mentorSkillModel.js';
import Province from './provinceModel.js';
import MentorPost from './mentorPostModel.js';
import SubscriptionPlan from './subscriptionPlanModel.js';
import Subscription from './subscriptionModel.js';
import TransactionDetail from './transactionDetailModel.js';
import BakongPayment from './bakongPaymentModel.js';
import StripePayment from './stripePaymentModel.js';
import AccountHistoryLog from './accountHistoryLogModel.js';
import AccountHistory from './accountHistoryModel.js';
import CommunityType from './communityTypeModel.js';
import CommunityPost from './communityPostModel.js';
import CommunityHistory from './communityHistoryModel.js';
import OTP from './otpModel.js';
import MentorExperience from './mentorExperienceModel.js';
// --- Associations ---

// Mentor <-> MentorExperience (One-to-Many)
Mentor.hasMany(MentorExperience, { foreignKey: 'mentor_id' });
MentorExperience.belongsTo(Mentor, { foreignKey: 'mentor_id' });

// User <-> OTP (One-to-Many)
User.hasMany(OTP, { foreignKey: 'user_id' });
OTP.belongsTo(User, { foreignKey: 'user_id' });

// UserType <-> User (One-to-Many)
UserType.hasMany(User, { foreignKey: 'user_type_id' });
User.belongsTo(UserType, { foreignKey: 'user_type_id' });

// User <-> Admin (One-to-One)
User.hasOne(Admin, { foreignKey: 'user_id' });
Admin.belongsTo(User, { foreignKey: 'user_id' });

// Province <-> Student (One-to-Many)
Province.hasMany(Student, { foreignKey: 'province_id' });
Student.belongsTo(Province, { foreignKey: 'province_id' });

// Province <-> Mentor (One-to-Many)
Province.hasMany(Mentor, { foreignKey: 'province_id' });
Mentor.belongsTo(Province, { foreignKey: 'province_id' });

// User <-> Student (One-to-One)
User.hasOne(Student, { foreignKey: 'user_id' });
Student.belongsTo(User, { foreignKey: 'user_id' });

// User <-> Mentor (One-to-One)
User.hasOne(Mentor, { foreignKey: 'user_id' });
Mentor.belongsTo(User, { foreignKey: 'user_id' });

// User <-> UserSession (One-to-Many)
User.hasMany(UserSession, { foreignKey: 'user_id' });
UserSession.belongsTo(User, { foreignKey: 'user_id' });

// User <-> AccountHistory (One-to-Many)
User.hasMany(AccountHistory, { foreignKey: 'user_id' });
AccountHistory.belongsTo(User, { foreignKey: 'user_id' });

// User <-> AccountHistoryLog (One-to-Many)
User.hasMany(AccountHistoryLog, { foreignKey: 'user_id' });
AccountHistoryLog.belongsTo(User, { foreignKey: 'user_id' });

// User <-> CommunityPost (One-to-Many)
User.hasMany(CommunityPost, { foreignKey: 'user_id' });
CommunityPost.belongsTo(User, { foreignKey: 'user_id' });

// UserType <-> CommunityPost (One-to-Many)
UserType.hasMany(CommunityPost, { foreignKey: 'user_type_id' });
CommunityPost.belongsTo(UserType, { foreignKey: 'user_type_id' });

// CommunityType <-> CommunityPost (One-to-Many)
CommunityType.hasMany(CommunityPost, { foreignKey: 'community_type_id' });
CommunityPost.belongsTo(CommunityType, { foreignKey: 'community_type_id' });

// CommunityPost <-> CommunityHistory (One-to-Many)
CommunityPost.hasMany(CommunityHistory, { foreignKey: 'post_com_id' });
CommunityHistory.belongsTo(CommunityPost, { foreignKey: 'post_com_id' });

// Mentor <-> MentorPortfolio (One-to-Many)
Mentor.hasMany(MentorPortfolio, { foreignKey: 'mentor_id' });
MentorPortfolio.belongsTo(Mentor, { foreignKey: 'mentor_id' });

// Mentor <-> Subscription (One-to-One)
Mentor.hasOne(Subscription, { foreignKey: 'user_id' });
Subscription.belongsTo(Mentor, { foreignKey: 'user_id' });

// UserType <-> Subscription (One-to-Many)
UserType.hasMany(Subscription, { foreignKey: 'user_type_id' });
Subscription.belongsTo(UserType, { foreignKey: 'user_type_id' });

// Mentor <-> MentorSkill (One-to-Many)
Mentor.hasMany(MentorSkill, { foreignKey: 'user_id' });
MentorSkill.belongsTo(Mentor, { foreignKey: 'user_id' });

// Mentor <-> MentorPost (One-to-Many)
Mentor.hasMany(MentorPost, { foreignKey: 'user_id' });
MentorPost.belongsTo(Mentor, { foreignKey: 'user_id' });

// Skill <-> SubSkill (One-to-Many)
Skill.hasMany(SubSkill, { foreignKey: 'skill_id' });
SubSkill.belongsTo(Skill, { foreignKey: 'skill_id' });

// SubSkill <-> MentorSkill (One-to-Many)
SubSkill.hasMany(MentorSkill, { foreignKey: 'sub_skill_id' });
MentorSkill.belongsTo(SubSkill, { foreignKey: 'sub_skill_id' });

// Skill <-> MentorSkill (One-to-Many)
Skill.hasMany(MentorSkill, { foreignKey: 'skill_id' });
MentorSkill.belongsTo(Skill, { foreignKey: 'skill_id' });

// SubSkill <-> MentorPost (One-to-Many)
SubSkill.hasMany(MentorPost, { foreignKey: 'sub_skill_id' });
MentorPost.belongsTo(SubSkill, { foreignKey: 'sub_skill_id' });

// Province <-> MentorPost (One-to-Many)
Province.hasMany(MentorPost, { foreignKey: 'province_id' });
MentorPost.belongsTo(Province, { foreignKey: 'province_id' });

// SubscriptionPlan <-> Subscription (One-to-Many)
SubscriptionPlan.hasMany(Subscription, { foreignKey: 'subscription_Plan_id' });
Subscription.belongsTo(SubscriptionPlan, { foreignKey: 'subscription_Plan_id' });

// User <-> TransactionDetail (One-to-Many)
User.hasMany(TransactionDetail, { foreignKey: 'user_id' });
TransactionDetail.belongsTo(User, { foreignKey: 'user_id' });

// Subscription <-> TransactionDetail (One-to-Many)
Subscription.hasMany(TransactionDetail, { foreignKey: 'subscription_id' });
TransactionDetail.belongsTo(Subscription, { foreignKey: 'subscription_id' });

// User <-> BakongPayment (One-to-Many)
User.hasMany(BakongPayment, { foreignKey: 'user_id' });
BakongPayment.belongsTo(User, { foreignKey: 'user_id' });

// User <-> StripePayment (One-to-Many)
User.hasMany(StripePayment, { foreignKey: 'user_id' });
StripePayment.belongsTo(User, { foreignKey: 'user_id' });

// Subscription <-> StripePayment (One-to-Many)
Subscription.hasMany(StripePayment, { foreignKey: 'subscription_id' });
StripePayment.belongsTo(Subscription, { foreignKey: 'subscription_id' });

export {
  sequelize,
  UserType,
  User,
  UserSession,
  Admin,
  Student,
  Mentor,
  MentorPortfolio,
  Skill,
  SubSkill,
  MentorSkill,
  Province,
  MentorPost,
  SubscriptionPlan,
  Subscription,
  TransactionDetail,
  BakongPayment,
  StripePayment,
  AccountHistoryLog,
  AccountHistory,
  CommunityType,
  CommunityPost,
  CommunityHistory,
  OTP,
  MentorExperience,
};
