@marvel
Feature: Marvel Dashboard

  @visible
  Scenario: Dashboard loads successfully for desktop
    Given The user navigates to the Marvel Dashboard home page on a desktop device
    Then The dashboard should render differently based on the device type
    Then The dashboard loads successfully
    Then the characters are displayed on the dashboard home page
    Then A list of Marvel characters is displayed automatically with the following details:
      | Image | Name | Description | Status | Comics | Published |
    Then the character details include thumbnail, name, description, comics, and published date
    Then The number of comics and published date are displayed on desktop view
    When the user scrolls down the list
    Then additional characters are loaded dynamically
    Then the new characters are appended to the existing list


  @visibles
  Scenario: Dashboard loads successfully for mobile
    Given The user navigates to the Marvel Dashboard home page on a mobile device
    Then The dashboard should render differently based on the device type
    Then The dashboard loads successfully
    Then A list of Marvel characters is displayed automatically with the following details:
      | Image | Name | Description | Status | Comics | Published |

  @dynamicload
  Scenario: Dynamic loading of characters on scroll
    Given The user navigates to the Marvel Dashboard home page on a desktop device
    When the user scrolls down the list
  
  @apiresponse
  Scenario Outline: Search for characters by name
    Given The user navigates to the Marvel Dashboard home page on a desktop device
    Given the characters are displayed on the dashboard home page
    When the user enters "<SearchText>" in the search bar
    Then the list updates to display characters matching the search term
    And each displayed character contains a thumbnail, name, and description (if available)
    # Then the list updates to display characters matching the search term and the results match the API response
    Then the lists updates to display characters matching the search term and the results match the API response
    And I fetch the character data from Marvel API
    Then get the character id from the search results matching the name and description
    And click the first row image and validate character details and related comics
    Examples:
      | SearchText    |
      | 3-D Man       |
      | Absorbing Man |


  @searchs
  Scenario: Search functionality with no matching results
    Given The user navigates to the Marvel Dashboard home page on a desktop device
    Given the characters are displayed on the dashboard home page
    When the user enters "NonExistentCharacter" in the search bar
    Then no character thumbnails or details are shown

  @apiresponses
  Scenario: Character detail page
    Given I fetch the character data from Marvel API

  @apiresponses
  Scenario: Test search with special characters
    Given The user navigates to the Marvel Dashboard home page on a desktop device
    Given the characters are displayed on the dashboard home page
    When the user enters "Iron&Man" in the search bar
    Then no character thumbnails or details are shown

@freeze
  Scenario: Handle app freezing when clicking the back button:
    Given The user navigates to the Marvel Dashboard home page on a desktop device
    And The user navigates to the character details page
    Then The user clicks the back button in the browser
    And The app navigates back to the dashboard without freezing