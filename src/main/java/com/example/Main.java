/*
 * Copyright 2002-2014 the original author or authors.
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *      http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

package com.example;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.stereotype.Controller;
import org.springframework.web.bind.annotation.RequestMapping;

import org.springframework.web.bind.annotation.*;
import org.springframework.http.MediaType;

import javax.sql.DataSource;
import javax.servlet.http.HttpSession;

import java.sql.Connection;
import java.sql.ResultSet;
import java.sql.SQLException;
import java.sql.Statement;
import java.sql.Array;

import org.apache.commons.lang3.exception.ExceptionUtils;
import java.util.Arrays;
import java.util.Map;
import java.util.HashMap;
import java.util.ArrayList;

@Controller
@SpringBootApplication
public class Main {

  @Value("${spring.datasource.url}")
  private String dbUrl;

  @Bean
  public DataSource dataSource() throws SQLException {
    if (dbUrl == null || dbUrl.isEmpty()) {
      return new HikariDataSource();
    } else {
      HikariConfig config = new HikariConfig();
      config.setConnectionTimeout(300000);
      config.setJdbcUrl(dbUrl);
      return new HikariDataSource(config);
    }
  }

  @Autowired
  private DataSource dataSource;

  // Used for storing prices of "green", "pink", and "glasses".
  private static HashMap<String, Integer> prices = new HashMap<>();

  public static void main(String[] args) throws Exception {
    SpringApplication.run(Main.class, args);
  }

  ///////////////////// HOMEPAGE //////////////////////////

  @GetMapping("/")
  String index(Map<String, Object> model, HttpSession session) {
    session.setAttribute("uname", "guest");

    // Set prices of items in shop
    prices.put("green", 10);
    prices.put("pink", 20);
    prices.put("glasses", 30);

    try (Connection connection = dataSource.getConnection()) {
      Statement stmt = connection.createStatement();
      // This only needs to happen once.
      stmt.executeUpdate(
          "CREATE TABLE IF NOT EXISTS users (id TEXT PRIMARY KEY DEFAULT gen_random_uuid(), uname text, pass varchar(255), highscore int, coins int, glasses text, color text, unlocked text[])");
    } catch (Exception e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }
    return "index";
  }

  ////////////////////// LOGIN /////////////////////////////

  // Possible arrival from index page through anchor. 
  @GetMapping(path = "/login")
  public String getUserForm(Map<String, Object> model, HttpSession session) {
    User user = new User();
    model.put("user", user);
    session.setAttribute("uname", "guest");
    return "login";
  }

  @PostMapping(path = "/login", consumes = { MediaType.APPLICATION_FORM_URLENCODED_VALUE })
  public String handleBrowserLoginSubmit(User user, Map<String, Object> model, HttpSession session) throws Exception {

    try (Connection connection = dataSource.getConnection()) {
      Statement stmt = connection.createStatement();

      String message = validateUserLogin(user, stmt);
      if (message != "") {
        // UserLogin invalid
        user = new User();
        model.put("user", user);
        model.put("loginError", message);
        return "login";
      }

      // UserLogin valid
      session.setAttribute("uname", user.getUname());
      return "redirect:/game";

    } catch (Exception e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }
  }

  ////////////////////// SIGN UP /////////////////////////////

  @GetMapping(path = "/signup")
  public String getSignupForm(Map<String, Object> model, HttpSession session) {
    User user = new User();
    model.put("user", user);
    session.setAttribute("uname", "guest");
    return "signup";
  }

  @PostMapping(path = "/signup", consumes = { MediaType.APPLICATION_FORM_URLENCODED_VALUE })
  public String handleBrowserSignupSubmit(User user, Map<String, Object> model, HttpSession session) throws Exception {

    try (Connection connection = dataSource.getConnection()) {
      Statement stmt = connection.createStatement();

      String message = validateUserSignUp(user, stmt);
      if (message != "") {
        // UserSignUp invalid
        user = new User();
        model.put("user", user);
        model.put("signupError", message);
        return "signup";
      }

      // UserSignUp valid --> DON'T FORGET TO SIGN UP
      System.out.println(user.getPass());
      stmt.executeUpdate("INSERT INTO users (uname, pass, color, glasses, unlocked) VALUES ('" + user.getUname() + "','"
          + user.getPass() + "','" + user.getColor() + "','" + user.getGlasses() + "','" + "{}" + "')");
      session.setAttribute("uname", user.getUname());
      return "redirect:/game";

    } catch (Exception e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }
  }

  //////////////////// GAME ///////////////////////////////////

  @GetMapping(path = "/game")
  public String getScoreSubmissionForm(Map<String, Object> model, HttpSession session) {

    // This user object will be used for inline JS code
    try {
      User user = newUserObjFromSession(session);
      model.put("user", user);
      return "game";
    } catch (SQLException e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }
  }

  @PostMapping(path = "/game", consumes = { MediaType.APPLICATION_FORM_URLENCODED_VALUE })
  public String handleBrowserHighscoreSubmit(User user, Map<String, Object> model, HttpSession session)
      throws Exception {
    try (Connection connection = dataSource.getConnection()) {
      Statement stmt = connection.createStatement(ResultSet.TYPE_SCROLL_INSENSITIVE, ResultSet.CONCUR_UPDATABLE);

      ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE uname='" + user.getUname() + "'");
      if (rs.next()) {
        if (rs.getInt("highscore") < user.getHighscore()) {
          rs.updateInt("highscore", user.getHighscore());
          System.out.println(rs.getInt("highscore"));
        }
        rs.updateInt("coins", user.getCoins());
        rs.updateRow();
      }
      return "redirect:/game";

    } catch (Exception e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }

  }

  ////////////// SHOP /////////////////////////////////

  @GetMapping(path = "/shop")
  public String showShop(Map<String, Object> model, HttpSession session) {
    try {
      User user = newUserObjFromSession(session);
      model.put("prices", prices);
      model.put("user", user);
      return "shop";
    } catch (SQLException e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }
  }

  /**
   * Updates SQL database with new shop information, and then displays the
   * shop page based on the SQL database information.
   */
  @PostMapping(path = "/shop")
  public String handleShopStateChange(User formUser, Map<String, Object> model, HttpSession session) throws Exception {
    try (Connection connection = dataSource.getConnection()) {

      String uname = (String) session.getAttribute("uname");

      // String color = formUser.getColor();
      // String glasses = formUser.getGlasses();
      // String lastUnlocked = formUser.getLastUnlocked(); // from form

      // Get old user data from DB.
      Statement stmt = connection.createStatement();
      User oldUser = newUserObjFromSession(session);
      String[] unlocked = oldUser.getUnlocked();
      int coins = oldUser.getCoins();
      String color = oldUser.getColor();
      String glasses = oldUser.getGlasses();

      String lastUnlocked = formUser.getLastUnlocked();
      // If lastUnlocked is not empty string, remove coins from user and changed unlocked
      if (lastUnlocked != "") {

        // coins -= prices.get(lastUnlocked);
        int requiredAmount = prices.get(lastUnlocked);
        if (coins >= requiredAmount) {
          coins -= requiredAmount;
          unlocked = stringArrayAdd(unlocked, lastUnlocked);
          stmt.executeUpdate(String.format("UPDATE users SET coins='%d', unlocked='%s' WHERE uname='%s'", coins,
              stringify(unlocked), uname));
        }
      }

      if (formUser.getGlasses() != null) {
        glasses = formUser.getGlasses();
        stmt.executeUpdate(String.format("UPDATE users SET glasses='%s' WHERE uname='%s'", glasses, uname));
      }

      if (formUser.getColor() != null) {
        color = formUser.getColor();
        stmt.executeUpdate(String.format("UPDATE users SET color='%s' WHERE uname='%s'", color, uname));
      }

      return "redirect:/shop";

    } catch (Exception e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }
  }

  ///////////////////////////////////// LEADERBOARD ////////////////////////

  @GetMapping("/leaderboard")
  String db(Map<String, Object> model, HttpSession session) {
    User user = new User(); // creates new User object with empty
    User searchUser = new User(); // creates new User object with empty
    model.put("searchUser", searchUser);
    if (session.getAttribute("uname") == null) {
      user.setUname("guest");
    } else {
      user.setUname((String) session.getAttribute("uname"));
    }
    model.put("user", user);

    try (Connection connection = dataSource.getConnection()) {
      Statement stmt = connection.createStatement();
      ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE highscore IS NOT NULL ORDER BY highscore DESC"); // gets non zero highscores in decending order

      int counter = 0;
      ArrayList<User> output = new ArrayList<User>();
      while (rs.next() && counter < 100) {
        User tableUser = new User();
        tableUser.setHighscore(rs.getInt("highscore"));
        tableUser.setUname(rs.getString("uname"));
        tableUser.setPlace(rs.getRow()); // place in rank
        counter++;
        output.add(tableUser);
      }

      model.put("records", output);
      return "leaderboard";
    } catch (Exception e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }
  }

  @PostMapping(path = "/leaderboardSearch", consumes = { MediaType.APPLICATION_FORM_URLENCODED_VALUE })
  public String handleBrowserHighscoreSearch(User searchUser, Map<String, Object> model, HttpSession session)
      throws Exception {
    User user = new User(); // creates new User object with empty
    model.put("searchUser", searchUser);
    if (session.getAttribute("uname") == null) {
      user.setUname("guest");
    } else {
      user.setUname((String) session.getAttribute("uname"));
    }
    model.put("user", user);

    try (Connection connection = dataSource.getConnection()) {
      Statement stmt = connection.createStatement();
      ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE highscore IS NOT NULL ORDER BY highscore DESC"); // gets non zero highscores in decending order

      ArrayList<User> output = new ArrayList<User>();
      while (rs.next()) {
        if (rs.getString("uname").contains(searchUser.getUname())) {
          User tableUser = new User();
          tableUser.setHighscore(rs.getInt("highscore"));
          tableUser.setUname(rs.getString("uname"));
          tableUser.setPlace(rs.getRow()); // place in rank
          output.add(tableUser);
        }
      }
      model.put("records", output);
      return "leaderboard";
    } catch (Exception e) {
      model.put("message", ExceptionUtils.getStackTrace(e));
      return "error";
    }
  }

  ///////////////////////////////////////////////////////////

  // Convert a java string array into a SQL array input
  String stringify(String[] unlocked) {
    String unlockedString = "{";
    for (int i = 0; i < unlocked.length; i++) {
      unlockedString += "\"" + unlocked[i] + "\"";
      if (i != unlocked.length - 1) {
        unlockedString += ",";
      }
    }
    unlockedString += "}";
    return unlockedString;
  }

  // For user validation
  static boolean invalidCharacters(String input) {
    if (input.matches(".*['\" ;].*")) {
      return true;
    }
    return false;
  }

  /**
   * Possible output messages:
   * <ul>
    * <li> Invalid character in username or password.
    * <li> Please fill in username and password.
    * <li> Username does not exist.
    * <li> Password does not match.
   * </ul>
   */
  static String validateUserLogin(User user, Statement stmt) throws SQLException {
    if (invalidCharacters(user.getUname()) || invalidCharacters(user.getPass())) {
      return "Invalid character in username or password.";
    }
    if (user.getUname().equals("") || user.getPass().equals("")) {
      return "Please fill in username and password.";
    }

    ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE uname='" + user.getUname() + "'");

    if (!rs.next()) {
      return "Username does not exist.";
    }

    String stored_password = rs.getString("pass").trim();
    if (!stored_password.equals(user.getPass())) {
      return "Password does not match.";
    }

    return "";
  }

  /**
   * Possible output messages:
   * <ul>
   * <li> Invalid character in username or password.
   * <li> Please fill in username and password.
   * <li> Username already exists.
   * </ul>
   */
  static String validateUserSignUp(User user, Statement stmt) throws SQLException {
    if (invalidCharacters(user.getUname()) || invalidCharacters(user.getPass())) {
      return "Invalid character in username or password.";
    }
    if (user.getUname().equals("") || user.getPass().equals("")) {
      return "Please fill in username and password.";
    }

    ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE uname='" + user.getUname() + "'");
    if (rs.next()) {
      return "Username already exists.";
    }
    return "";
  }

  /////////////////////////////////////////////

  // Pass user object into model- useful for game and shop templates
  User newUserObjFromSession(HttpSession session) throws SQLException {
    User user = new User();
    if (session.getAttribute("uname") == null) {
      user.setUname("guest");
    } else {
      user.setUname((String) session.getAttribute("uname"));
    }

    Connection connection = dataSource.getConnection(); //fetch user data
    Statement stmt = connection.createStatement();
    ResultSet rs = stmt.executeQuery("SELECT * FROM users WHERE uname='" + user.getUname() + "'");

    if (!rs.next()) {
      return null;
    }

    user.setHighscore(rs.getInt("highscore"));
    user.setColor(rs.getString("color"));
    user.setGlasses(rs.getString("glasses"));
    user.setCoins(rs.getInt("coins"));
    Array unlockedArray = rs.getArray("unlocked"); // SQL style array
    String[] unlocked = (String[]) unlockedArray.getArray();
    System.out.println("String array unlocked = " + Arrays.toString(unlocked));
    user.setUnlocked(unlocked);
    return user;
  }

  // Simple add for string arrays by making a new array
  String[] stringArrayAdd(String[] ar, String string) {
    String[] out = new String[ar.length + 1];
    System.arraycopy(ar, 0, out, 0, ar.length);
    out[out.length - 1] = string;
    return out;
  }
}
