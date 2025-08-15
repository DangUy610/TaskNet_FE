// src/pages/ProfileAndVisibility.jsx
import React, { useEffect, useState } from "react";
import styled from "styled-components";
import axiosClient from "../../../../api/apiClient";
import { useNavigate } from "react-router-dom";

/** ===================== Styled Components ===================== */
const Container = styled.div`
  min-height: 100vh;
  background: #f1f2f4;
  display: flex;
`;

const Sidebar = styled.aside`
  width: 240px;
  background: white;
  border-right: 1px solid #dfe1e6;
  padding: 0;
`;

const SidebarSection = styled.div`
  padding: 16px 0;
  border-bottom: 1px solid #dfe1e6;
`;

const SectionTitle = styled.h3`
  font-size: 12px;
  font-weight: 600;
  color: #6b778c;
  text-transform: uppercase;
  margin: 0 0 8px 0;
  padding: 0 16px;
  letter-spacing: 0.04em;
`;

const NavItem = styled.div`
  padding: 8px 16px;
  cursor: ${p => p.disabled ? 'not-allowed' : 'pointer'};
  color: ${p => p.disabled ? '#a5adba' : p.active ? '#0079bf' : '#172b4d'};
  background: ${p => p.active ? '#e4f0f6' : 'transparent'};
  font-weight: ${p => p.active ? '600' : '400'};
  border-right: ${p => p.active ? '2px solid #0079bf' : 'none'};
  
  &:hover {
    background: ${p => p.disabled ? 'transparent' : p.active ? '#e4f0f6' : '#f4f5f7'};
  }
`;

const MainContent = styled.main`
  flex: 1;
  background: #f1f2f4;
  overflow-y: auto;
`;

const ContentWrapper = styled.div`
  max-width: 864px;
  margin: 0 auto;
  padding: 32px 16px;
`;

const Header = styled.div`
  margin-bottom: 32px;
`;

const Title = styled.h1`
  font-size: 24px;
  font-weight: 600;
  color: #172b4d;
  margin: 0 0 8px 0;
`;

const Subtitle = styled.p`
  color: #6b778c;
  margin: 0;
  font-size: 14px;
`;

const Card = styled.div`
  background: white;
  border-radius: 8px;
  box-shadow: 0 1px 2px rgba(9, 30, 66, 0.25);
  margin-bottom: 16px;
  overflow: hidden;
`;

const CardHeader = styled.div`
  padding: 20px 20px 0 20px;
  border-bottom: 1px solid #dfe1e6;
  margin-bottom: 20px;
`;

const CardTitle = styled.h2`
  font-size: 16px;
  font-weight: 600;
  color: #172b4d;
  margin: 0 0 8px 0;
`;

const CardDescription = styled.p`
  color: #6b778c;
  font-size: 14px;
  margin: 0 0 16px 0;
`;

const CardContent = styled.div`
  padding: 0 20px 20px 20px;
`;

const FormRow = styled.div`
  display: grid;
  grid-template-columns: ${p => p.single ? '1fr' : '1fr 1fr'};
  gap: 16px;
  margin-bottom: 16px;
`;

const FormGroup = styled.div`
  display: flex;
  flex-direction: column;
`;

const Label = styled.label`
  font-size: 12px;
  font-weight: 600;
  color: #6b778c;
  margin-bottom: 4px;
  text-transform: uppercase;
`;

const Input = styled.input`
  padding: 8px 12px;
  border: 2px solid #dfe1e6;
  border-radius: 4px;
  font-size: 14px;
  color: #172b4d;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #0079bf;
  }
  
  &::placeholder {
    color: #a5adba;
  }
`;

const Textarea = styled.textarea`
  padding: 8px 12px;
  border: 2px solid #dfe1e6;
  border-radius: 4px;
  font-size: 14px;
  color: #172b4d;
  min-height: 80px;
  resize: vertical;
  font-family: inherit;
  transition: border-color 0.2s ease;
  
  &:focus {
    outline: none;
    border-color: #0079bf;
  }
  
  &::placeholder {
    color: #a5adba;
  }
`;

const AvatarSection = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
  margin: 20px 0;
`;

const Avatar = styled.div`
  width: 64px;
  height: 64px;
  border-radius: 50%;
  background: #dfe1e6;
  display: flex;
  align-items: center;
  justify-content: center;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const AvatarInitial = styled.div`
  font-size: 24px;
  font-weight: 600;
  color: #6b778c;
`;

const UploadButton = styled.label`
  padding: 8px 16px;
  background: #0079bf;
  color: white;
  border-radius: 4px;
  cursor: pointer;
  font-size: 14px;
  font-weight: 500;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #005a8b;
  }
  
  input {
    display: none;
  }
`;

const Button = styled.button`
  padding: 10px 16px;
  background: #0079bf;
  color: white;
  border: none;
  border-radius: 4px;
  font-size: 14px;
  font-weight: 500;
  cursor: pointer;
  transition: background-color 0.2s ease;
  
  &:hover {
    background: #005a8b;
  }
  
  &:disabled {
    background: #a5adba;
    cursor: not-allowed;
  }
`;

const CheckboxGroup = styled.div`
  display: flex;
  flex-direction: column;
  gap: 12px;
  margin: 16px 0;
`;

const CheckboxItem = styled.label`
  display: flex;
  align-items: center;
  gap: 8px;
  cursor: pointer;
  font-size: 14px;
  color: #172b4d;
  
  input {
    width: 16px;
    height: 16px;
    accent-color: #0079bf;
  }
`;

const Banner = styled.div`
  height: 120px;
  background: linear-gradient(135deg, #0079bf, #005a8b);
  border-radius: 8px 8px 0 0;
  display: flex;
  align-items: center;
  justify-content: center;
  position: relative;
  overflow: hidden;
  
  img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }
`;

const BannerUpload = styled.label`
  position: absolute;
  top: 8px;
  right: 8px;
  padding: 6px 12px;
  background: rgba(0, 0, 0, 0.5);
  color: white;
  border-radius: 4px;
  font-size: 12px;
  cursor: pointer;
  
  input {
    display: none;
  }
`;

const BannerPlaceholder = styled.div`
  color: rgba(255, 255, 255, 0.8);
  font-size: 14px;
`;

/** ===================== Component ===================== */
export default function ProfileAndVisibility() {
  const navigate = useNavigate();
  
  const [form, setForm] = useState({
    username_public: "",
    bio: "",
    is_discoverable: true,
    show_boards_on_profile: false,
    avatar_url: "",
    banner_url: "",
  });
  
  const [avatarFile, setAvatarFile] = useState(null);
  const [bannerFile, setBannerFile] = useState(null);
  const [saving, setSaving] = useState(false);

  useEffect(() => {
    // Load profile từ backend
    axiosClient.get("/accounts/me/profile/").then(({ data }) => {
      setForm(prev => ({ ...prev, ...data }));
    }).catch(err => {
      console.error("Error loading profile:", err);
    });
  }, []);

  const handleInputChange = (field, value) => {
    setForm(prev => ({ ...prev, [field]: value }));
  };

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setAvatarFile(file);
    }
  };

  const handleBannerChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setBannerFile(file);
    }
  };

  const handleSave = async () => {
    setSaving(true);
    try {
      const fd = new FormData();
      fd.append("username_public", form.username_public || "");
      fd.append("bio", form.bio || "");
      fd.append("is_discoverable", form.is_discoverable);
      fd.append("show_boards_on_profile", form.show_boards_on_profile);
      if (avatarFile) fd.append("avatar", avatarFile);
      if (bannerFile) fd.append("banner", bannerFile);

      await axiosClient.patch("/accounts/me/profile/", fd, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      // Refresh data after save
      const { data } = await axiosClient.get("/accounts/me/profile/");
      setForm(prev => ({ ...prev, ...data }));
      
      // Reset file inputs
      setAvatarFile(null);
      setBannerFile(null);
      
    } catch (error) {
      console.error("Error saving profile:", error);
    } finally {
      setSaving(false);
    }
  };

  return (
    <Container>
      <Sidebar>
        <SidebarSection>
          <SectionTitle>Personal Settings</SectionTitle>
          <NavItem active>Profile and visibility</NavItem>
          <NavItem disabled>Settings</NavItem>
          <NavItem disabled>Activity</NavItem>
          <NavItem disabled>Cards</NavItem>
        </SidebarSection>
        
        <SidebarSection>
          <SectionTitle>Workspace</SectionTitle>
          <NavItem onClick={() => navigate("/boards")}>Boards</NavItem>
          <NavItem disabled>Members</NavItem>
          <NavItem disabled>Settings</NavItem>
          <NavItem disabled>Upgrade workspace</NavItem>
        </SidebarSection>
      </Sidebar>

      <MainContent>
        <ContentWrapper>
          <Header>
            <Title>Profile and visibility</Title>
            <Subtitle>
              Manage your personal information and control who can see and access your account.
            </Subtitle>
          </Header>

          {/* Profile Picture Card */}
          <Card>
            <Banner>
              {form.banner_url ? (
                <img src={form.banner_url} alt="Profile banner" />
              ) : (
                <BannerPlaceholder>Add a banner to your profile</BannerPlaceholder>
              )}
              <BannerUpload>
                <input type="file" accept="image/*" onChange={handleBannerChange} />
                Change
              </BannerUpload>
            </Banner>
            
            <CardContent>
              <AvatarSection>
                <Avatar>
                  {form.avatar_url ? (
                    <img src={form.avatar_url} alt="Profile" />
                  ) : (
                    <AvatarInitial>
                      {form.username_public ? form.username_public.charAt(0).toUpperCase() : 'U'}
                    </AvatarInitial>
                  )}
                </Avatar>
                <div>
                  <UploadButton>
                    <input type="file" accept="image/*" onChange={handleAvatarChange} />
                    Change avatar
                  </UploadButton>
                </div>
              </AvatarSection>
            </CardContent>
          </Card>

          {/* About Card */}
          <Card>
            <CardHeader>
              <CardTitle>About</CardTitle>
              <CardDescription>
                This information will appear on your profile.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <FormRow single>
                <FormGroup>
                  <Label>Username *</Label>
                  <Input
                    type="text"
                    value={form.username_public}
                    onChange={(e) => handleInputChange('username_public', e.target.value)}
                    placeholder="Enter your username"
                  />
                </FormGroup>
              </FormRow>
              
              <FormRow single>
                <FormGroup>
                  <Label>Bio</Label>
                  <Textarea
                    value={form.bio || ""}
                    onChange={(e) => handleInputChange('bio', e.target.value)}
                    placeholder="Tell people a bit about yourself..."
                  />
                </FormGroup>
              </FormRow>
            </CardContent>
          </Card>

          {/* Privacy Settings Card */}
          <Card>
            <CardHeader>
              <CardTitle>Privacy</CardTitle>
              <CardDescription>
                Control who can see your profile and find you on Trello.
              </CardDescription>
            </CardHeader>
            
            <CardContent>
              <CheckboxGroup>
                <CheckboxItem>
                  <input 
                    type="checkbox" 
                    checked={!!form.is_discoverable}
                    onChange={(e) => handleInputChange('is_discoverable', e.target.checked)}
                  />
                  Make my profile public
                </CheckboxItem>
                <CheckboxItem>
                  <input 
                    type="checkbox"
                    checked={!!form.show_boards_on_profile}
                    onChange={(e) => handleInputChange('show_boards_on_profile', e.target.checked)}
                  />
                  Show my boards on my public profile
                </CheckboxItem>
              </CheckboxGroup>
              
              <Button onClick={handleSave} disabled={saving}>
                {saving ? "Saving..." : "Save"}
              </Button>
            </CardContent>
          </Card>
        </ContentWrapper>
      </MainContent>
    </Container>
  );
}